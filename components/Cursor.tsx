'use client'
import { useEffect } from 'react'

export default function Cursor(){
  useEffect(()=>{
    const dot = document.getElementById('curDot') || document.createElement('div')
    const ring = document.getElementById('curRing') || document.createElement('div')
    dot.id = 'curDot'
    ring.id = 'curRing'
    if(!document.getElementById('curDot')) document.body.appendChild(dot)
    if(!document.getElementById('curRing')) document.body.appendChild(ring)

    function onMove(e: MouseEvent){
      const x = e.clientX
      const y = e.clientY
      dot.style.left = x + 'px'
      dot.style.top = y + 'px'
      ring.style.left = x + 'px'
      ring.style.top = y + 'px'
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  },[])

  return null
}
