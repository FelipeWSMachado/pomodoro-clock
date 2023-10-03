import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import stopIco from "./assets/hand_stop_icon.ico";
import play from "./assets/continue.ico";

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

  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const sendNotification = (title, options) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  const modes = {
    work: {
      next: "break",
      time: settingsInfo.breakMinutes,
      notification: {
        body: "Time for a break!",
        icon: play,
      },
    },
    break: {
      next: "work",
      time: settingsInfo.workMinutes,
      notification: {
        body: "Time to get back to work!",
        icon: stopIco,
      },
    },
  };

  const handleSwitchMode = useCallback(() => {
    const currentMode = modeRef.current;
    const nextModeData = modes[currentMode];

    setMode(nextModeData.next);
    modeRef.current = nextModeData.next;
    const nextSeconds = nextModeData.time * 60;
    setSecondsLeft(nextSeconds);
    secondsLeftRef.current = nextSeconds;

    sendNotification("Pomodoro Clock", nextModeData.notification);
  }, [modes]); // assuming modes can change and is defined within the component

  useEffect(() => {
    requestNotificationPermission();

    setSecondsLeft(settingsInfo.workMinutes * 60);
    secondsLeftRef.current = settingsInfo.workMinutes * 60;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      if (secondsLeftRef.current === 0) return handleSwitchMode();
      secondsLeftRef.current--;
      setSecondsLeft(secondsLeftRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [settingsInfo, handleSwitchMode]);

  const totalSeconds =
    mode === "work"
      ? settingsInfo.workMinutes * 60
      : settingsInfo.breakMinutes * 60;

  const percentage = Math.round((secondsLeft / totalSeconds) * 100);

  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = `0${s % 60}`.slice(-2);
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
        {isPaused ? (
          <PlayButton
            onClick={() => {
              setIsPaused(false);
              isPausedRef.current = false;
            }}
          />
        ) : (
          <PauseButton
            onClick={() => {
              setIsPaused(true);
              isPausedRef.current = true;
            }}
          />
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
      </div>
    </div>
  );
}
