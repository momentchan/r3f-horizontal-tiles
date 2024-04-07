import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Utilities from "./r3f-gist/utility/Utilities";
import Items from "./Items";
import { Suspense } from "react";

export default function App() {
    return <>
        <Suspense>
            <Canvas
                gl={{ preserveDrawingBuffer: true }}
            >
                <color attach='background' args={['#151515']} />
                <Items />

                <Utilities />

            </Canvas>
        </Suspense >
    </>
}