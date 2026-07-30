'use client'
import { useEffect } from 'react'

export default function ProgressBar(){
  useEffect(()=>{
    const el = document.getElementById('progressBar') || document.createElement('div')
    el.id = 'progressBar'
    if(!document.getElementById('progressBar')) document.body.appendChild(el)
    function onScroll(){
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      el.style.width = Math.min(100,Math.max(0,scrolled)) + '%'
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return ()=> window.removeEventListener('scroll', onScroll)
  },[])
  return null
}
