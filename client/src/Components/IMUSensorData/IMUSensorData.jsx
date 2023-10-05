import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './IMUSensorData.css';

const IMUSensorData = () => {
    const sensorData = {
        acceleration_x: 0.1,
        acceleration_y: 0.2,
        acceleration_z: 0.3,
        gyroscope_x: 10,
        gyroscope_y: 0,
        gyroscope_z: 0,
        magnetometer_x: 0.1,
        magnetometer_y: 0.2,
        magnetometer_z: 0.3,
    };

    const sensor3DRef = useRef(null);
    const rendererRef = useRef(null);
    const meshRef = useRef(null);

    useEffect(() => {
        const sensorElement = sensor3DRef.current;
        const gyroscope_x = parseFloat(sensorData.gyroscope_x);
        const gyroscope_y = parseFloat(sensorData.gyroscope_y);
        const gyroscope_z = parseFloat(sensorData.gyroscope_z);

        // Check if the renderer has already been initialized
        if (!rendererRef.current) {
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth *0.75, window.innerHeight *0.75);
            sensorElement.innerHTML = '';
            sensorElement.appendChild(renderer.domElement);
            rendererRef.current = renderer;
        }

        const renderer = rendererRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('white');
        const ambientLight = new THREE.AmbientLight(0xffffff, 4); // Color, Intensity
        scene.add(ambientLight);
        const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.position.set(0, 0, -50);

        // Clear previous mesh if it exists
        if (meshRef.current) {
            scene.remove(meshRef.current);
            meshRef.current = null;
        }

        new GLTFLoader().load('src/assets/scene.gltf', function (model) {
            const { scene: loadedModel } = model;


            scene.add(loadedModel);
            loadedModel.scale.setScalar(0.75);
         

            camera.lookAt(loadedModel.position);
            meshRef.current = loadedModel;
          });

        const animate = () => {
            if (meshRef.current) {
                if (!isNaN(gyroscope_x) && !isNaN(gyroscope_y) && !isNaN(gyroscope_z)) {
                    const rotationY = gyroscope_y;
                    const rotationZ = gyroscope_z;
                    const rotationX = gyroscope_x;
                    meshRef.current.rotation.set(rotationX, rotationY, rotationZ);
                }
            }

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }
        };
    }, [sensorData]);

    return (
        <div>
            <h1>Human Activity Sensor Data</h1>
            <div className="container">
                <div className="left-side">
                    <h2>Acceleration:</h2>
                    <p>x: {sensorData.acceleration_x}</p>
                    <p>y: {sensorData.acceleration_y}</p>
                    <p>z: {sensorData.acceleration_z}</p>

                    <h2>Gyroscope:</h2>
                    <p>x: {sensorData.gyroscope_x}</p>
                    <p>y: {sensorData.gyroscope_y}</p>
                    <p>z: {sensorData.gyroscope_z}</p>

                    <h2>Magnetometer:</h2>
                    <p>x: {sensorData.magnetometer_x}</p>
                    <p>y: {sensorData.magnetometer_y}</p>
                    <p>z: {sensorData.magnetometer_z}</p>
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
