import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"
import { useEffect, useRef, useState } from "react";
import {SnackbarProvider} from 'notistack'
import axios from "axios";
import APIURL, { getAuthorizationHeader, getAuthorId } from "../../api/config";
import { useSnackbar } from 'notistack';


import Layer1 from "./layer1.svg"
import Layer2 from "./layer2.svg"
import Layer3 from "./layer3.svg"
import Layer4 from "./layer4.svg"
import "./Root.css"

const Root = () => {
    const navigate = useNavigate()
    const root = useRef<any>()
    const button = useRef<any>()
    const svg1 = useRef<any>()
    const svg2 = useRef<any>()
    const svg3 = useRef<any>()
    const svg4 = useRef<any>()
    const text = useRef<any>()
    const backdrop = useRef<any>()

    const [timeline] = useState(gsap.timeline({paused: true}))
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        getNode()
        timeline
            .to(button.current, { scale: 1.2})
            .to(root.current, {background: "linear-gradient(30deg, #ef5757 0%, #e1ae4a 100%)"}, 0)
            /* Credit to: https://gsap.com/community/forums/topic/11361-typewriter-effect/ */
            .fromTo(".anim-typewriter", {
                width: "0",
              }, {
                width: "6.6em", /* same as CSS .line-1 width */
                ease: "steps(12)",
                duration: 1.5,
              }, 0)
            .fromTo(".anim-typewriter", {
                "border-right-color": "rgba(243,243,243,0.75)"
              }, {
                "border-right-color": "rgba(243,243,243,0)",
                duration: 0.5,
                repeat: -1,
                ease: "steps(12)"
              }, 0)
            .to(svg1.current, {top: "20%"}, 0.1)
            .to(svg2.current, {top: "20%"}, 0.2)
            .to(svg3.current, {top: "20%"}, 0.3)
            .to(svg4.current, {top: "20%"}, 0.4)
            .reverse()
    }, [])

    const transition = () => {
      gsap.to(backdrop.current, {top: "0", onComplete: () => {navigate('/login')}})
    }

    const getNode = async () => {
      try {
        await axios.get(`${APIURL}/authors/node`)
      } catch {
        enqueueSnackbar("Unable to fetch authors", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      }
    }


    return (
        <>
        <div className="root" ref={root}>
            <p className="line-1 anim-typewriter" ref={text} style={{zIndex: 100, fontFamily: 'monospace'}}>hello world.</p>
            <button style={{zIndex: 100}} ref={button} onMouseEnter={() => {timeline.play()}} onMouseLeave={() => {timeline.reverse()}} className="root-button" onClick={() => transition()}>login</button>
        </div>
        <img src={Layer1} ref={svg1} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 4, height: "100vh", width: "100vw"}}/>
        <img src={Layer2} ref={svg2} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 3, height: "100vh", width: "100vw"}}/>
        <img src={Layer3} ref={svg3} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 2, height: "100vh", width: "100vw"}}/>
        <img src={Layer4} ref={svg4} style={{objectFit:"cover", position:"fixed", top: "100vh", zIndex: 1, height: "100vh", width: "100vw"}}/>
        <div ref={backdrop}className="backdrop" />
        </>
    )    
}

export default Root