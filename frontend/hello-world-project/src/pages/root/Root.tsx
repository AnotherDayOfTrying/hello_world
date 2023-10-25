import { Navigate, useNavigate } from "react-router-dom"
import { gsap } from "gsap"
import "./Root.css"
import Test1 from "./layer1.svg"
import Test2 from "./layer2.svg"
import Test3 from "./layer3.svg"
import Test4 from "./layer4.svg"
import { useEffect, useRef, useState } from "react";

const Root = () => {
    const navigate = useNavigate()
    const root = useRef<any>()
    const button = useRef<any>()
    const svg1 = useRef<any>()
    const svg2 = useRef<any>()
    const svg3 = useRef<any>()
    const svg4 = useRef<any>()
    const text = useRef<any>()

    const [timeline] = useState(gsap.timeline({paused: true}))

    useEffect(() => {
        timeline
            .to(button.current, { scale: 1.2})
            .to(root.current, {background: "linear-gradient(30deg, #ef5757 0%, #e1ae4a 100%)"}, 0)
            .fromTo(".anim-typewriter", 1.5, {
                width: "0",
              }, {
                width: "6.6em", /* same as CSS .line-1 width */
                ease: "steps(12)"
              }, 0)
            .fromTo(".anim-typewriter", 0.5, {
                "border-right-color": "rgba(243,243,243,0.75)"
              }, {
                "border-right-color": "rgba(243,243,243,0)",
                repeat: -1,
                ease: "steps(12)"
              }, 0)
            .to(svg1.current, {top: "20%"}, 0.1)
            .to(svg2.current, {top: "20%"}, 0.2)
            .to(svg3.current, {top: "20%"}, 0.3)
            .to(svg4.current, {top: "20%"}, 0.4)
            .reverse()
    }, [])


    return (
        <>
        <div className="root" ref={root}>
            <p className="line-1 anim-typewriter" ref={text} style={{zIndex: 100, fontFamily: 'monospace'}}>hello world.</p>
            <button style={{zIndex: 100}} ref={button} onMouseEnter={() => {timeline.play()}} onMouseLeave={() => {timeline.reverse()}} className="root-button" onClick={() => navigate("/login")}>login</button>
        </div>
        <img src={Test1} ref={svg1} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 4, height: "100vh", width: "100vw"}}/>
        <img src={Test2} ref={svg2} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 3, height: "100vh", width: "100vw"}}/>
        <img src={Test3} ref={svg3} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 2, height: "100vh", width: "100vw"}}/>
        <img src={Test4} ref={svg4} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 1, height: "100vh", width: "100vw"}}/>
        </>
    )    

    return <Navigate to="/login" />
}


export default Root