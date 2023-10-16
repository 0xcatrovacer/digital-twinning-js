import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('src/assets/textures/grid.jpg', function(texture) {
            scene.background = texture;
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 4); // Color, Intensity
        scene.add(ambientLight);

        // Initialization of camera
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 3000);
        camera.position.set(800, 0, 0);

        // Clear previous mesh if it exists
        if (meshRef.current) {
            scene.remove(meshRef.current);
            meshRef.current = null;
        }

        const meshGroup = new THREE.Group();
        const stationaryMeshGroup = new THREE.Group();

        if (!meshRef.current) {
            new GLTFLoader().load('src/assets/robot_arm.gltf', function (model) {
                const { scene: loadedModel } = model;

                loadedModel.traverse(function (child) {
                    if (child.isMesh) {
                        console.log('Mesh Name:', child.name);
                    }
                });
                
                const meshesToAdd = [];
                loadedModel.traverse(function (child) {
                    if (child.isMesh) {
                        switch (child.name) {
                            case "Cylinder017_Material001_0":
                            case "Cylinder028_Material001_0":
                            case "Cylinder015_Material001_0":
                            case "Cylinder019_Material001_0":
                            case "Cylinder007_Material001_0":
                                meshesToAdd.push(child.clone()); // clone the meshes instead of directly pushing
                                break;
                            default:
                                break;
                        }
                    }
                });

                meshesToAdd.forEach(mesh => {
                    switch (mesh.name) {
                        case "Cylinder017_Material001_0":
                            mesh.position.set(0, -50, 105);
                            break;
                        case "Cylinder028_Material001_0":
                            mesh.position.set(0, -50, 85);
                            break;
                        case "Cylinder015_Material001_0":
                            mesh.position.set(0, -50, 55);
                            break;
                        case "Cylinder019_Material001_0":
                            mesh.position.set(0, -30, 25);
                            break;
                        case "Cylinder007_Material001_0":
                            mesh.position.set(0, 0, 0);
                            break;
                        default:
                            break;
                    }
                    meshGroup.add(mesh);
                }); 

                const stationaryMeshes = [];
                loadedModel.traverse(function (child) {
                    if (child.isMesh) {
                        switch (child.name) {
                            case "Cylinder018_Material001_0":
                            case "Cylinder011_Material001_0":
                            case "Cylinder010_Material001_0":
                            case "Cylinder009_Material001_0":
                                stationaryMeshes.push(child.clone()); // clone the meshes instead of directly pushing
                                break;
                            default:
                                break;
                        }
                    }
                });


                stationaryMeshes.forEach(mesh => {
                    switch (mesh.name) {
                        case "Cylinder018_Material001_0":
                            mesh.position.set(0, 0, 105);
                            break;
                        case "Cylinder011_Material001_0":
                            mesh.position.set(0, 0, 85);
                            break;
                        case "Cylinder010_Material001_0":
                            mesh.position.set(0, 0, 55);
                            break;
                        case "Cylinder009_Material001_0":
                            mesh.position.set(0, 0, 25);
                            break;
                        default:
                            break;
                    }
                    stationaryMeshGroup.add(mesh);
                }); 

                stationaryMeshGroup.position.set(0, -280, 30);
                stationaryMeshGroup.rotation.set(-1.57, 0, 0)
                scene.add(stationaryMeshGroup);
                
                meshGroup.position.set(0, 0, 0);
                scene.add(meshGroup);
                
                camera.lookAt(meshGroup.position);
                meshRef.current = meshGroup;

                meshGroup.scale.setScalar(2)
                stationaryMeshGroup.scale.setScalar(2);
                
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
            
            if (meshGroup) {
                if (!isNaN(angular_position_x) && !isNaN(angular_position_y) && !isNaN(angular_position_z)) {
                    const rotationY = angular_position_y;
                    const rotationZ = angular_position_z;
                    const rotationX = angular_position_x;
                    meshGroup.rotation.set(rotationX, rotationY, rotationZ);
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
