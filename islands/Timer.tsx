import { useEffect, useState } from "preact/hooks";

const DEFAULT_DURATION = 900_000; // 15 minutes
const DEFAULT_DECREMENT = 1000;
const pomodoro = "\uD83C\uDF45";
const startedIndicator = "\uD83D\uDFE2";
const stoppedIndicator = "\uD83D\uDD34";
const pausedButton = "\u23F8\uFE0F";
const playButton = "\u25B6\uFE0F";
const resetButton = "\uD83D\uDD03";
const editButton = "\u270F\uFE0F";
const leftArrow = "\u2B05\uFE0F";
const rightArrow = "\u27A1\uFE0F";
const saveButton = "\uD83D\uDCBE";

type Interruption = {
  id: string;
  createdAt: Date;
  endedAt?: Date;
  reason?: string;
};

type Pomodoro = {
  id: string;
  name?: string;
  startedAt?: Date;
  finishedAt?: Date;
  interruptions: Interruption[];
};

type PomodoroData = {
  id: string;
  initializedAt: Date;
  pomodoros: Pomodoro[];
};

const keyFrom = (p: Pomodoro) => btoa(JSON.stringify(p));

const displayTime = (mseconds: number) => {
  const minutes = ~~((mseconds / 1000) / 60);
  const seconds = (mseconds - (minutes * 60 * 1000)) / 1000;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const minutesSecondsToMillis = (minutes: number, seconds: number) => {
  return ((minutes * 60 * 1000) + (seconds) * 1000);
};

const dig = (
  id: string,
): { from: <T extends Pomodoro>(arg: T[]) => [T | undefined, T[]] } => {
  return {
    from: (list) => [
      list.find((i) => i.id === id),
      list.filter((i) => i.id !== id),
    ],
  };
};

const session = {
  id: crypto.randomUUID(),
  initializedAt: new Date(),
  pomodoros: [{
    id: crypto.randomUUID(),
    interruptions: [],
  }],
};

export default function Timer() {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [isEditing, setIsEditing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeoutHandle, setTimeoutHandle] = useState<number>();
  const [pomodoroData, setPomodoroData] = useState<PomodoroData>(session);
  const [currentPomodoroId, setCurrentPomodoroId] = useState<string>(
    pomodoroData.pomodoros[0].id,
  );
  const [pendingDurationMinutes, setPendingDurationMinutes] = useState(0);
  const [pendingDurationSeconds, setPendingDurationSeconds] = useState(0);

  const initNewPomodoro = () => {
    const [currentPomodoro, pomodoros] = dig(currentPomodoroId).from(
      pomodoroData.pomodoros,
    );
    if (currentPomodoro) {
      const nextId = crypto.randomUUID();
      setCurrentPomodoroId(nextId);
      const newPomodoro = { id: nextId, interruptions: [] };
      setPomodoroData({
        ...pomodoroData,
        pomodoros: [...pomodoros, newPomodoro],
      });
    }
  };

  const resetDuration = () => {
    const nextDuration =
      minutesSecondsToMillis(pendingDurationMinutes, pendingDurationSeconds) ||
      DEFAULT_DURATION;
    setDuration(nextDuration);
  };

  useEffect(() => {
    if (isStarted && duration > 0) {
      setTimeoutHandle(setTimeout(
        () => {
          setDuration(duration - DEFAULT_DECREMENT);
        },
        DEFAULT_DECREMENT,
      ));
    }
    if (isStarted && duration === 0) {
      setIsStarted(false);
      const [currentPomodoro, pomodoros] = dig(currentPomodoroId).from(
        pomodoroData.pomodoros,
      );
      if (currentPomodoro) {
        const id = crypto.randomUUID();
        setCurrentPomodoroId(id);
        const newPomodoro = { id, interruptions: [] };
        setPomodoroData({
          ...pomodoroData,
          pomodoros: [...pomodoros, {
            ...currentPomodoro,
            finishedAt: new Date(),
          }, newPomodoro],
        });
      }
      resetDuration();
    }
  }, [duration, isStarted]);

  useEffect(() => {
    const [currentPomodoro, pomodoros] = dig(currentPomodoroId).from(
      pomodoroData.pomodoros,
    );
    if (isEditing) {
      if (currentPomodoro && isStarted) {
        setPomodoroData({
          ...pomodoroData,
          pomodoros: [...pomodoros, {
            ...currentPomodoro,
            interruptions: [...currentPomodoro.interruptions, {
              id: crypto.randomUUID(),
              createdAt: new Date(),
              reason: "Edit menu opened",
            }],
          }],
        });
      }
      setIsStarted(false);
      clearTimeout(timeoutHandle);
    } else {
      if (currentPomodoro) {
        const [lastInterruption] = currentPomodoro.interruptions.slice(-1);
        if (!lastInterruption) return;
        lastInterruption.endedAt = new Date();
        setPomodoroData({
          ...pomodoroData,
          pomodoros: [...pomodoros, {
            ...currentPomodoro,
            interruptions: [...currentPomodoro.interruptions.slice(0, -1), {
              ...lastInterruption,
            }],
          }],
        });
      }
    }
  }, [isEditing, isStarted]);

  const toggleEdit = () => {
    setIsEditing((prevState) => !prevState);
  };

  const handleDurationChange = (event: Event) => {
    if (event instanceof Event) {
      const { target } = event;
      if (target && "name" in target) {
        const { name } = target;
        switch (name) {
          case "decrement-minute":
            pendingDurationMinutes > 0 &&
              setPendingDurationMinutes(pendingDurationMinutes - 1);
            break;
          case "increment-minute":
            setPendingDurationMinutes(pendingDurationMinutes + 1);
            break;
          case "decrement-second":
            pendingDurationSeconds > 0 &&
              setPendingDurationSeconds(pendingDurationSeconds - 1);
            break;
          case "increment-second":
            setPendingDurationSeconds(pendingDurationSeconds + 1);
            break;
        }
      }
    }
  };

  const handleStart = () => {
    if (isEditing) setIsEditing(false);
    const [currentPomodoro, pomodoros] = dig(currentPomodoroId).from(
      pomodoroData.pomodoros,
    );
    if (currentPomodoro) {
      const [lastInterruption] = currentPomodoro.interruptions.slice(-1);
      if (lastInterruption && !lastInterruption.endedAt) {
        setPomodoroData({
          ...pomodoroData,
          pomodoros: [...pomodoros, {
            ...currentPomodoro,
            interruptions: [...currentPomodoro.interruptions.slice(0, -1), {
              ...lastInterruption,
              endedAt: new Date(),
            }],
          }],
        });
      } else {
        setPomodoroData({
          ...pomodoroData,
          pomodoros: [...pomodoros, {
            ...currentPomodoro,
            startedAt: new Date(),
          }],
        });
      }
    }
    setIsStarted(true);
  };

  const handleStop = () => {
    setIsStarted(false);
    clearTimeout(timeoutHandle);
    const [currentPomodoro, pomodoros] = dig(currentPomodoroId).from(
      pomodoroData.pomodoros,
    );
    if (currentPomodoro) {
      setPomodoroData({
        ...pomodoroData,
        pomodoros: [...pomodoros, {
          ...currentPomodoro,
          interruptions: [...currentPomodoro.interruptions, {
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }],
        }],
      });
    }
  };

  const handleUpdate = () => {
    const newDuration = minutesSecondsToMillis(
      pendingDurationMinutes,
      pendingDurationSeconds,
    );
    initNewPomodoro();
    setDuration(newDuration);
    toggleEdit();
  };

  const handleReset = () => {
    setIsStarted(false);
    clearTimeout(timeoutHandle);
    resetDuration();
    initNewPomodoro();
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-4">
        <h1 className="col-start-4 col-span-1 text-right text-2xl">
          {displayTime(duration)}
        </h1>
        <div className="text-xs leading-8">
          {isStarted ? startedIndicator : stoppedIndicator}
        </div>
        {isStarted
          ? (
            <button
              className="inline-block col-start-2 col-span-2 focus:outline-none"
              onClick={handleStop}
            >
              {pausedButton}
            </button>
          )
          : (
            <button
              className="inline-block col-start-2 col-span-2 focus:outline-none"
              onClick={handleStart}
            >
              {playButton}
            </button>
          )}
        <button
          className="inline-block col-span-2"
          onClick={handleReset}
        >
          {resetButton}
        </button>
        <button
          className="inline-block col-span-2 focus:outline-none"
          onClick={toggleEdit}
        >
          {editButton}
        </button>
        {isEditing && (
          <>
            <label className="col-start-2 col-span-3">Minutes</label>
            <label className="col-span-4">Seconds</label>
            <button
              className="inline-block col-start-1 col-span-1 focus:outline-none"
              name="decrement-minute"
              onClick={handleDurationChange}
            >
              {leftArrow}
            </button>
            <input
              className="inline-block col-span-1 text-gray-900 shadow rounded text-right"
              type="number"
              readonly={true}
              value={pendingDurationMinutes}
            />
            <button
              className="inline-block col-span-1 focus:outline-none"
              name="increment-minute"
              onClick={handleDurationChange}
            >
              {rightArrow}
            </button>
            <button
              className="inline-block col-span-1 focus:outline-none"
              name="decrement-second"
              onClick={handleDurationChange}
            >
              {leftArrow}
            </button>
            <input
              className="inline-block col-span-1 text-gray-900 shadow rounded text-right"
              readonly={true}
              type="number"
              value={pendingDurationSeconds}
            />
            <button
              className="inline-block col-span-1 focus:outline-none"
              name="increment-second"
              onClick={handleDurationChange}
            >
              {rightArrow}
            </button>
            <button
              className="focus:outline-none"
              onClick={handleUpdate}
            >
              {saveButton}
            </button>
          </>
        )}
      </div>
      <h2 className="text-center uppercase">Completed pomodoros</h2>
      <div>
        {pomodoroData.pomodoros.length <= 0
          ? <span>No pomodoros finished yet...</span>
          : (
            pomodoroData.pomodoros.filter((p) => p.finishedAt).map((p) => (
              <span key={keyFrom(p)} title={JSON.stringify(p)}>{pomodoro}</span>
            ))
          )}
      </div>
    </>
  );
}
