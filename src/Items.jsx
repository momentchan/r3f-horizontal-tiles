import { Image, Scroll, ScrollControls, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import * as THREE from 'three'
import { useRef, useState } from "react";
import { easing } from 'maath'
import { state } from "./state";

const material = new THREE.LineBasicMaterial({ color: 'white' })
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.5, 0)])

function Minimap() {
    const ref = useRef()
    const scroll = useScroll()
    const { urls } = useSnapshot(state)
    const { height } = useThree((state) => state.viewport)

    useFrame((state, delta) => {
        ref.current.children.forEach((child, index) => {
            const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
            easing.damp(child.scale, 'y', 0.15 + y / 6, 0.15, delta)
        })
    })

    return (
        <group ref={ref}>
            {urls.map((_, i) =>
                <line key={i} geometry={geometry} material={material} position={[i * 0.06 - urls.length * 0.03, -height / 2 + 0.6, 0]} />
            )}
        </group>

    )
}

function Item({ scale, position, index, c = new THREE.Color(), ...props }) {

    const ref = useRef()
    const { clicked, urls } = useSnapshot(state)
    const [hovered, hover] = useState(false)

    const click = () => { state.clicked = index === clicked ? null : index }
    const over = () => hover(true)
    const out = () => hover(false)

    const scroll = useScroll()

    useFrame((state, delta) => {
        const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
        easing.damp3(ref.current.scale, [clicked === index ? 4.7 : scale[0], clicked === index ? 5 : 4 + y, 1], 0.15, delta)

        ref.current.material.scale.x = ref.current.scale.x
        ref.current.material.scale.y = ref.current.scale.y
        if (clicked !== null && index < clicked) easing.damp(ref.current.position, 'x', position[0] - 2, 0.15, delta)
        if (clicked !== null && index > clicked) easing.damp(ref.current.position, 'x', position[0] + 2, 0.15, delta)
        if (clicked === null || clicked === index) easing.damp(ref.current.position, 'x', position[0], 0.15, delta)
        easing.damp(ref.current.material, 'grayscale', hovered || clicked === index ? 0 : Math.max(0, 1 - y), 0.15, delta)
        easing.dampC(ref.current.material.color, hovered || clicked === index ? 'white' : '#aaa', hovered ? 0.3 : 0.15, delta)
    })

    return <Image ref={ref} {...props} position={position} scale={scale} onClick={click} onPointerOver={over} onPointerOut={out} />
}

export default function Items({ w = 0.7, gap = 0.15 }) {
    const { urls } = useSnapshot(state)

    const { width } = useThree((state) => state.viewport)
    const xW = w + gap

    return (
        <ScrollControls horizontal damping={0.1} pages={(width - xW + urls.length * xW) / width}>
            <Minimap />
            <Scroll>
                {urls.map((url, i) => <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[w, 4, 1]} url={url} />) /* prettier-ignore */}
            </Scroll>
        </ScrollControls>
    )
}