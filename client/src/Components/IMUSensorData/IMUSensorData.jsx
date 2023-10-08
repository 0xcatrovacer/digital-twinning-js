import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios'
;import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './IMUSensorData.css';

const IMUSensorData = () => {

    const sensor3DRef = useRef(null);
    const rendererRef = useRef(null);
    const meshRef = useRef(null);
    const animationFrameID = useRef(null);
    const currentIndex = useRef(0);

    
    const [sensorDataArray, setSensorDataArray] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);


    useEffect(() => {
        async function getData() {
            const response = await axios.get('http://127.0.0.1:8000/sensor/fetch-data');
            setSensorDataArray(response.data.data);
            setDataFetched(true);
        }
        
        getData();
    }, [])

    useEffect(() => {
        if (!dataFetched) return;

        const sensorElement = sensor3DRef.current;

        // Initialization of renderer
        if (!rendererRef.current) {
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.6);
            sensorElement.innerHTML = '';
            sensorElement.appendChild(renderer.domElement);
            rendererRef.current = renderer;
        }
        const renderer = rendererRef.current;

        // Initialization of scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('white');
        const ambientLight = new THREE.AmbientLight(0xffffff, 4); // Color, Intensity
        scene.add(ambientLight);

        // Initialization of camera
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.2, 5000);
        camera.position.set(0, 0, -50);

        // Clear previous mesh if it exists
        if (meshRef.current) {
            scene.remove(meshRef.current);
            meshRef.current = null;
        }

        if (!meshRef.current) {
            new GLTFLoader().load('src/assets/scene.gltf', function (model) {
                const { scene: loadedModel } = model;
                scene.add(loadedModel);
                loadedModel.scale.setScalar(1);
                camera.lookAt(loadedModel.position);
                meshRef.current = loadedModel;

                // Start the animation only after the model has been loaded
                animate();
            });
        } else {
            animate();
        }

        const animate = () => {
            // Retrieve the current sensor data again inside the animate function
            const currentSensorData = sensorDataArray[currentIndex.current];
            const angular_position_x = parseFloat(currentSensorData.angular_position_x);
            const angular_position_y = parseFloat(currentSensorData.angular_position_y);
            const angular_position_z = parseFloat(currentSensorData.angular_position_z);
            
            if (meshRef.current) {
                if (!isNaN(angular_position_x) && !isNaN(angular_position_y) && !isNaN(angular_position_z)) {
                    const rotationY = angular_position_y;
                    const rotationZ = angular_position_z;
                    const rotationX = angular_position_x;
                    meshRef.current.rotation.set(rotationX, rotationY, rotationZ);
                }
            }
            
            renderer.render(scene, camera);

            if (currentIndex.current < sensorDataArray.length - 1) {
                animationFrameID.current = setTimeout(() => {
                    const nextIndex = currentIndex.current + 1;
                    setCurrentDisplayIndex(nextIndex);
                    currentIndex.current = nextIndex;

                    animate();
                }, 50);
            }
        };

    return () => {
        if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
        }

        if (animationFrameID.current) {
            cancelAnimationFrame(animationFrameID.current);
        }
    };

}, [dataFetched]);


    return (
        sensorDataArray.length > 0 && <div>
            <h1>IMU Sensor Data</h1>
            <div className="container">
                <div className="left-side">
                    <h2>Acceleration:</h2>
                    <p>x: {sensorDataArray[currentDisplayIndex].acc_x}</p>
                    <p>y: {sensorDataArray[currentDisplayIndex].acc_y}</p>
                    <p>z: {sensorDataArray[currentDisplayIndex].acc_z}</p>

                    <h2>Linear Position:</h2>
                    <p>x: {sensorDataArray[currentDisplayIndex].position_x}</p>
                    <p>y: {sensorDataArray[currentDisplayIndex].position_y}</p>
                    <p>z: {sensorDataArray[currentDisplayIndex].position_z}</p>

                    <h2>Angular Position:</h2>
                    <p>x: {sensorDataArray[currentDisplayIndex].angular_position_x}</p>
                    <p>y: {sensorDataArray[currentDisplayIndex].angular_position_y}</p>
                    <p>z: {sensorDataArray[currentDisplayIndex].angular_position_z}</p>

                    <h2>Magnetometer:</h2>
                    <p>x: {sensorDataArray[currentDisplayIndex].mgm_x}</p>
                    <p>y: {sensorDataArray[currentDisplayIndex].mgm_y}</p>
                    <p>z: {sensorDataArray[currentDisplayIndex].mgm_z}</p>
                </div>
                <div className="right-side">
                    <h2>3D Model:</h2>
                    <div id="sensor-3d" ref={sensor3DRef} style={{ transition: 'transform 0.2s ease' }} />
                </div>
            </div>
        </div>
    );
};

export default IMUSensorData;
