import { useContext, useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SettingsButton from "./SettingsButton";
import SettingsContext from "./SettingsContext";

import "react-circular-progressbar/dist/styles.css";

const RED_COLOR = "#f54e4e";
const GREEN_COLOR = "#4aec8c";

export default function Timer() {
  const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  useEffect(() => {
    function handleSwitchMode() {
      const nextMode = modeRef.current === "work" ? "break" : "work";
      const nextSeconds = 
        (nextMode === "work"
          ? settingsInfo.workMinutes
          : settingsInfo.breakMinutes) * 60;

      setMode(nextMode);
      modeRef.current = nextMode;

      setSecondsLeft(nextSeconds);
      secondsLeftRef.current = nextSeconds;
    }

    secondsLeftRef.current = settingsInfo.workMinutes * 60;
    setSecondsLeft(secondsLeftRef.current);

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      if (secondsLeftRef.current === 0) return handleSwitchMode();
      secondsLeftRef.current--;
      setSecondsLeft(secondsLeftRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [settingsInfo]);

  const totalSeconds = 
    mode === "work"
      ? settingsInfo.workMinutes * 60
      : settingsInfo.breakMinutes * 60;

  const percentage = Math.round((secondsLeft / totalSeconds) * 100);

  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = (`0${s % 60}`).slice(-2);
    return `${minutes}:${seconds}`;
  };

  const pathColor = mode === "work" ? RED_COLOR : GREEN_COLOR;

  return (
    <div>
      <CircularProgressbar
        value={percentage}
        text={formatTime(secondsLeft)}
        styles={buildStyles({
          textColor: "#fff",
          pathColor: pathColor,
          tailColor: "rgba(255,255,255,.2)",
        })}
      />
      <div style={{ marginTop: "20px" }}>
        {isPaused 
          ? <PlayButton onClick={() => {
              setIsPaused(false);
              isPausedRef.current = false;
            }} />
          : <PauseButton onClick={() => {
              setIsPaused(true);
              isPausedRef.current = true;
            }} />
        }
      </div>
      <div style={{ marginTop: "20px" }}>
        <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
      </div>
    </div>
  );
}
