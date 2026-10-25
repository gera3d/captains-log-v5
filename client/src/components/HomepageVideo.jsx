import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const HomepageVideo = forwardRef(function HomepageVideo({ onComplete, onRequestAccess, accessLabel }, ref) {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 650px)").matches);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 650px)");
    const update = () => {
      setMobile(query.matches);
      setPlaying(false);
      setPending(false);
      setError("");
      setStarted(false);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  async function play() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await videoRef.current.play();
    } catch {
      setError("The video couldn’t start. Please try again.");
    } finally {
      setPending(false);
    }
  }
  useImperativeHandle(ref, () => ({ play }));

  return (
    <section className="home-video home-container" aria-label="Watch the GoodIdea overview">
      <div className={mobile ? "home-video-frame home-video-mobile" : "home-video-frame"}>
      <video
        ref={videoRef}
        key={mobile ? "mobile" : "desktop"}
        className="home-video-player"
        src={mobile ? "/video/goodidea-mobile-64127f9f.mp4" : "/video/goodidea-desktop-fa671209.mp4"}
        poster={mobile ? "/video/goodidea-mobile-poster-v2.jpg" : "/video/goodidea-desktop-poster-v2.jpg"}
        width={mobile ? 1080 : 1920}
        height={mobile ? 1920 : 1080}
        controls={started}
        tabIndex={0}
        onPlaying={() => { setPlaying(true); setStarted(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setStarted(false); setCompleted(true); onComplete(); videoRef.current.load(); }}
        playsInline
        preload="none"
        aria-label="GoodIdea product overview, 29 seconds"
      >
        Your browser does not support embedded video.
      </video>
        <div className="home-video-actions">
        {completed && !playing && <button className="home-primary home-video-next" type="button" onClick={onRequestAccess}>{accessLabel}</button>}
        <button key="playback" className={completed ? "home-video-play home-video-replay" : "home-video-play"} type="button" onClick={playing ? () => videoRef.current.pause() : play} aria-disabled={pending} aria-label={playing ? "Pause video" : completed ? "Replay the 29-second video" : "Watch the 29-second video"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d={playing ? "M6 4h4v16H6zm8 0h4v16h-4z" : "M7 4v16l14-8z"} /></svg>
          <span>{pending ? "Starting video…" : playing ? "Pause video" : completed ? "Replay video" : "Watch the 29-second video"}</span>
        </button>
        </div>
      </div>
      {error && <p className="home-video-error" role="alert">{error}</p>}
    </section>
  );
});

export default HomepageVideo;
