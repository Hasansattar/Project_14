import React from "react"
import Header from "./header"
import Lolly from "./lolly"
import { navigate } from "gatsby"
import "./style.css"

export default function Home() {
  return (
    <div className="main">
      <Header />
      <div className="main-lolly">
        <Lolly top="red" middle="green" bottom="blue" />

        <Lolly top="pink" middle="skyblue" bottom="yellow" />

        <Lolly top="blue" middle="silver" bottom="blue" />

        <Lolly top="purple" middle="blue" bottom="green" />

        <Lolly top="orange" middle="pink" bottom="blue" />
      </div>

      <div className="button">
        {" "}
        <button
          onClick={() => {
            navigate("/Home")
          }}
        >
          Create Lolly
        </button>
      </div>
    </div>
  )
}
