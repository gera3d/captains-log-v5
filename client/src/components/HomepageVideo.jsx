import { useEffect, useState } from "react";

export default function HomepageVideo() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 650px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 650px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className="home-video home-container" aria-label="Watch the GoodIdea overview">
      <video
        key={mobile ? "mobile" : "desktop"}
        className={mobile ? "home-video-player home-video-mobile" : "home-video-player"}
        src={mobile ? "/video/goodidea-mobile-64127f9f.mp4" : "/video/goodidea-desktop-fa671209.mp4"}
        poster={mobile ? "/video/goodidea-mobile-poster.jpg" : "/video/goodidea-desktop-poster.jpg"}
        width={mobile ? 1080 : 1920}
        height={mobile ? 1920 : 1080}
        controls
        playsInline
        preload="none"
        aria-label="GoodIdea product overview, 29 seconds"
      >
        Your browser does not support embedded video.
      </video>
    </section>
  );
}
