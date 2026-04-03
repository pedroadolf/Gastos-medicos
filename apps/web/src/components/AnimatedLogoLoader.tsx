"use client";

import { Player } from "@remotion/player";
import { LogoAnimation } from "@/remotion/LogoAnimation";

export default function AnimatedLogoLoader() {
    return (
        <div className="flex items-center justify-center w-full h-full relative z-50 overflow-hidden">
            <Player
                component={LogoAnimation}
                durationInFrames={150}
                compositionWidth={800}
                compositionHeight={400}
                fps={30}
                autoPlay
                loop
                acknowledgeRemotionLicense
                style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "transparent"
                }}
            />
        </div>
    );
}
