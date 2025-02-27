import * as THREE from "three";
import {
    Canvas,
    extend,
    useFrame,
    useLoader,
    useThree,
} from "@react-three/fiber";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
    OrbitControls,
    PerspectiveCamera,
    shaderMaterial,
    Stats,
    useCubeTexture,
} from "@react-three/drei";
import { Surface } from "./model/surface";
import { TextureLoader } from "three";
import glsl from "babel-plugin-glsl/macro";

const SkyShaderMaterial = shaderMaterial(
    {
        uColor: new THREE.Color(0.2, 0.4, 0.8),
    },
    glsl`
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
`,
    glsl`
        uniform vec3 uColor;

        varying vec2 vUv;

        void main() {
            float atmosphere = sqrt(1.0-vUv.y);
            vec3 skyColor = uColor;
            vec3 scatterColor = mix(vec3(1.0),vec3(1.0,0.3,0.0) * 1.5,0.0);
            vec3 sky = mix(skyColor, vec3(scatterColor), atmosphere / 0.9);
            gl_FragColor = vec4(sky , 1.0);
        }
`
);

extend({ SkyShaderMaterial });

function Box() {
    const ref = useRef<any>();
    useFrame((state, delta) => {
        ref.current.position.y = 10 + Math.sin(state.clock.elapsedTime) * 20;
        ref.current.rotation.x =
            ref.current.rotation.y =
            ref.current.rotation.z +=
                delta;
    });
    return (
        <mesh ref={ref} scale={20}>
            <boxGeometry />
            <meshStandardMaterial />
        </mesh>
    );
}

const SkyBox = () => {
    const { scene, gl } = useThree();
    const environmentMap = useCubeTexture(
        [
            "Left_Tex.png",
            "Right_Tex.png",
            "Up_Tex.png",
            "Down_Tex.png",
            "Front_Tex.png",
            "Back_Tex.png",
        ],
        { path: "/environment/Skybox_8/" }
    );
    const background = useLoader(TextureLoader, "/concept.png");
    const clouds = useLoader(TextureLoader, "/clouds.png");

    useEffect(() => {
        scene.environment = environmentMap;
        scene.environment.encoding = THREE.sRGBEncoding;
    }, [background]);

    // useEffect(() => {
    //     console.log(scene);
    //     scene.background = environmentMap;
    //     scene.environment = environmentMap;
    //     scene.environment.encoding = THREE.sRGBEncoding;
    // }, [environmentMap, scene]);

    return (
        <>
            <Suspense fallback={null}>
                <mesh scale={400}>
                    <sphereGeometry attach="geometry" />
                    {/* @ts-ignore */}
                    <skyShaderMaterial
                        side={THREE.BackSide}
                        uColor={new THREE.Color(0.2, 0.4, 0.8)}
                    />
                    {/* <meshBasicMaterial
                        attach="material"
                        map={background}
                        side={THREE.BackSide}
                    /> */}
                </mesh>
                <mesh scale={399}>
                    <sphereGeometry attach="geometry" />
                    <meshBasicMaterial
                        attach="material"
                        map={clouds}
                        side={THREE.DoubleSide}
                        transparent
                    />
                </mesh>
                {/* <Environment
                    background={true}
                    path="/environment/Skybox_8/"
                    files={[
                        "Left_Tex.png",
                        "Right_Tex.png",
                        "Up_Tex.png",
                        "Down_Tex.png",
                        "Front_Tex.png",
                        "Back_Tex.png",
                    ]}
                /> */}
            </Suspense>
        </>
    );
};

function App() {
    const cameraRef = useRef<any>();
    const orbitRef = useRef<any>();

    useEffect(() => {
        console.log(cameraRef);
    }, [cameraRef]);

    useEffect(() => {
        console.log(orbitRef);
    }, [orbitRef]);

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <Canvas
            // 하늘
            // camera={{
            //     position: [0, 500, 100],
            //     fov: 90,
            //     near: 1,
            //     far: 20000,
            // }}
            // 우주
            // camera={{
            //     position: [0, 800, 100],
            //     fov: 55,
            //     near: 1,
            //     far: 20000,
            // }}
            >
                <PerspectiveCamera
                    ref={cameraRef}
                    makeDefault
                    position={[0, 5, 100]}
                    fov={90}
                    near={1}
                    far={20000}
                />
                {/* <ambientLight intensity={2} />
                <directionalLight position={[10, 10, 0]} intensity={1.5} />
                <directionalLight position={[-10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, 20, 0]} intensity={1.5} />
                <directionalLight position={[0, -10, 0]} intensity={0.25} /> */}
                <Suspense fallback={null}>
                    <Surface />
                </Suspense>

                {/* <Sky
                    // @ts-ignore
                    scale={10000}
                    sunPosition={[500, 150, -1000]}
                    turbidity={0.1}
                /> */}
                <Suspense fallback={null}>
                    <SkyBox />
                </Suspense>

                <OrbitControls
                    ref={orbitRef}
                    target={new THREE.Vector3(0, 0, 0)}
                />
                <Stats />
            </Canvas>
        </div>
    );
}

export default App;
