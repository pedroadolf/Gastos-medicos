"use client";

import { Composition } from "remotion";
import { LogoAnimation } from "./LogoAnimation";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="PashLogo"
                component={LogoAnimation}
                durationInFrames={150} // 5 Segundos a 30fps
                fps={30}
                width={1080}  // Cuadrado/Story aspect o Ajustable según uso (Ej: Renderizado de mails)
                height={1080}
            />
        </>
    );
};
