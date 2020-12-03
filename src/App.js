import './App.css';
import React from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';

let intervalID;
let playPromise;

function App() {
  const [breakTime, setBreakTime] = React.useState(5);
  const [sessionTime, setSessionTime] = React.useState(25);

  const [isSession, setIsSession] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);

  const [time, setTime] = React.useState(1500);

  const audioElement = React.useRef(null);

  const runTime = React.useCallback(() => {
    const id = setInterval(() => {
      if (isRunning) {
        setTime((time) => --time);
      }
    }, 1000);

    intervalID = id;
  }, [isRunning]);

  React.useEffect(() => {
    if (isRunning) {
      runTime();
    } else {
      clearInterval(intervalID);
    }
  }, [isRunning, runTime]);

  // set timers
  React.useEffect(() => {
    isSession ? setTime(sessionTime * 60) : setTime(breakTime * 60);
  }, [breakTime, sessionTime, isSession]);

  // hand over logic
  React.useEffect(() => {
    if (time === 0) {
      if (isSession) {
        setTime(breakTime * 60);
        setIsSession(false);
      } else {
        setTime(sessionTime * 60);
        setIsSession(true);
      }
      audioElement.current.currentTime = 0;
      playPromise = audioElement.current.play();
    }
  }, [time, isSession, sessionTime, breakTime]);

  // React.useEffect(() => {
  //   console.log({ breakTime });
  //   console.log({ sessionTime });
  //   console.log({ isRunning });
  //   console.log({ isSession });
  //   console.log({ time });
  // }, [breakTime, sessionTime, isRunning, isSession, time]);

  const formatTime = (time) => {
    // 3600 === 60 === 1 hour === 01:00:00 and not 00:60:00
    if (time === 3600) return '60:00';

    return new Date(time * 1000).toISOString().substr(14, 5);
  };

  const handleResetTime = () => {
    // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    // weird fix for test causing the browser to throw an error on .pause()

    // Only calling .pause() inside .then() does not pass the test (it does work correctly though and doesn't throw in the browser)
    // calling .pause() before .then() doesn't throw in the browser???
    // both calls to .pause() are needed to pass the test and not throw???
    if (playPromise !== undefined) {
      audioElement.current.pause();
      playPromise
        .then((_) => {
          audioElement.current.pause();
          audioElement.current.currentTime = 0;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    clearInterval(intervalID);
    setBreakTime(5);
    setSessionTime(25);
    setTime(sessionTime * 60);
    setIsSession(true);
    setIsRunning(false);
  };

  const inRange = (number) => {
    if (number > 60 || number === 0) {
      return false;
    }
    return true;
  };

  const validKeyEvent = (event) => {
    const { key } = event;
    return key === 'ArrowUp' || key === 'ArrowDown';
  };

  const handleIncrementBreak = (event) => {
    if (isRunning) return;

    if (event.type === 'keydown') {
      if (!validKeyEvent(event)) {
        return;
      }
    }

    if (inRange(breakTime + 1)) {
      setBreakTime((state) => ++state);
    }
  };

  const handleDecrementBreak = (event) => {
    if (isRunning) return;

    if (event.type === 'keydown') {
      if (!validKeyEvent(event)) {
        return;
      }
    }

    if (inRange(breakTime - 1)) {
      setBreakTime((state) => --state);
    }
  };

  const handleIncrementSession = (event) => {
    if (isRunning) return;

    if (event.type === 'keydown') {
      if (!validKeyEvent(event)) {
        return;
      }
    }

    if (inRange(sessionTime + 1)) {
      setSessionTime((state) => ++state);
    }
  };

  const handleDecrementSession = (event) => {
    if (isRunning) return;

    if (event.type === 'keydown') {
      if (!validKeyEvent(event)) {
        return;
      }
    }

    if (inRange(sessionTime - 1)) {
      setSessionTime((state) => --state);
    }
  };

  return (
    <div className="App">
      <div className="clock">
        <CircularProgressbarWithChildren
          id="time-left"
          value={Math.ceil(time / 60)}
          maxValue={60}
          minValue={0}
          styles={buildStyles({
            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            strokeLinecap: 'butt',
            // How long animation takes to go from one percentage to another, in seconds
            pathTransitionDuration: 0.5,
            pathColor: `var(--red)`,
            trailColor: '#d6d6d6',
            backgroundColor: '#3e98c7',
          })}
        >
          <div className="clock-content">
            {isSession ? (
              <p id="timer-label">Session</p>
            ) : (
              <p id="timer-label">Break</p>
            )}
            <p id="time-left">{formatTime(time)}</p>
          </div>
        </CircularProgressbarWithChildren>

        <div className="clock-control-container">
          <button
            className="clock-button clock-button--red"
            id="start_stop"
            onClick={() => setIsRunning((state) => !state)}
          >
            {isRunning ? (
              <i className="fas fa-pause"></i>
            ) : (
              <i className="fas fa-play"></i>
            )}
          </button>
          <button
            className="clock-button clock-button--red"
            id="reset"
            onClick={handleResetTime}
          >
            <i className="fas fa-sync"></i>
          </button>
        </div>

        <div className="time-control-container">
          <div className="time-control mr2">
            <p className="time-control-label" id="break-label">
              Break Length
            </p>
            <button
              className="clock-button clock-button--green"
              id="break-increment"
              onClick={handleIncrementBreak}
              onKeyDown={handleIncrementBreak}
            >
              <i className="fas fa-arrow-up"></i>
            </button>
            <p id="break-length">{breakTime}</p>
            <button
              className="clock-button clock-button--green"
              id="break-decrement"
              onClick={handleDecrementBreak}
              onKeyDown={handleDecrementBreak}
            >
              <i className="fas fa-arrow-down"></i>
            </button>
          </div>

          <div className="time-control">
            <p className="time-control-label" id="session-label">
              Session Length
            </p>
            <button
              className="clock-button clock-button--green"
              id="session-increment"
              onClick={handleIncrementSession}
              onKeyDown={handleIncrementSession}
            >
              <i className="fas fa-arrow-up"></i>
            </button>
            <p id="session-length">{sessionTime}</p>
            <button
              className="clock-button clock-button--green"
              id="session-decrement"
              onClick={handleDecrementSession}
              onKeyDown={handleDecrementSession}
            >
              <i className="fas fa-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>

      <audio
        id="beep"
        preload="auto"
        ref={audioElement}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
      <footer className="footer">
        <p>Made by &#64;lasjorg</p>
      </footer>
    </div>
  );
}

export default App;
