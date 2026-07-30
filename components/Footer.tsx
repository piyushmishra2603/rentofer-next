'use client'
import React from 'react'

export default function Footer(){
  return (
    <footer>
      <div className="wrap" style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'40px 0'}}>
          <div>
            <div style={{fontFamily:'var(--f-display)',fontSize:18,color:'var(--gold-lt)',fontWeight:700}}>SmartRent AI</div>
            <div style={{color:'rgba(255,255,255,.6)',maxWidth:360}}>Find verified PGs, hostels, flats and co-living spaces across India. AI-powered matching, zero brokerage.</div>
          </div>
          <div style={{color:'rgba(255,255,255,.8)'}}>© {new Date().getFullYear()} SmartRent AI</div>
        </div>
      </div>
    </footer>
  )
}
