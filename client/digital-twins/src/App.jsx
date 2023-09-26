import './App.css'

function App() {
  

  return (
   <div className='model'>

    <div className='left-container'>

      <div className='title'><h1>IMU Sensor Data</h1></div>

      <div className='contents'>
        <div className='acceleration'>
          <h3>Acceleration</h3>
            <p>x:</p>
            <p>y:</p>
            <p>z:</p>
        </div>

        <div className='gyroscope'>
          <h3>Gyroscope</h3>
            <p>x:</p>
            <p>y:</p>
            <p>z:</p>
        </div>

        <div className='magnetometer'>
          <h3>Magnetometer</h3>
            <p>x:</p>
            <p>y:</p>
            <p>z:</p>
        </div>
      </div>
      
    </div>
    
    <div className='right-container'>

    <div className='title'><h1>3D Model</h1></div>

    </div>

   </div>
  )
}

export default App
