import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const LogoAnimation: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animación 1: Escala inicial (Efecto "Rebote" o "Pop")
    const scale = spring({
        frame,
        fps,
        config: { damping: 10, mass: 0.5, stiffness: 150 },
    });

    // Animación 2: Fade-In
    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });

    // Animación 3: Movimiento en Y (Subida elegante)
    const translateY = interpolate(frame, [0, 30], [20, 0], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });

    return (
        <AbsoluteFill className="bg-transparent flex flex-col items-center justify-center">
            <div
                style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    opacity
                }}
                className="text-center"
            >
                <div className="relative inline-block" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16, 185, 129, 0.2)', filter: 'blur(30px)', transform: 'scale(1.5)' }}></div>
                    <h1 style={{ fontSize: '8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.05em', color: '#10B981', position: 'relative', zIndex: 10 }}>
                        PASH
                    </h1>
                </div>
                <p
                    style={{
                        fontSize: '2rem',
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4em',
                        marginTop: '1rem',
                        opacity: interpolate(frame, [15, 45], [0, 1], { extrapolateRight: "clamp" }),
                        transform: `translateY(${interpolate(frame, [15, 45], [10, 0], { extrapolateRight: "clamp" })}px)`
                    }}
                >
                    Automation
                </p>
            </div>
        </AbsoluteFill>
    );
};
