// Funktion zum Konvertieren von SVG-Pfaden in Three.js Shapes
function transformSVGPathExposed(pathStr) {
    // Implementierung erforderlich oder verwenden Sie eine Bibliothek zur Konvertierung
    // Beispiel für eine einfache Implementierung:
    const shape = new THREE.Shape();
    // Fügen Sie hier den Code hinzu, um den SVG-Pfad zu analysieren und Punkte hinzuzufügen
    return shape;
}

// Load and process TopoJSON data
d3.json('path/to/your/topojson.json').then(data => {
    const sandusky = topojson.feature(data, data.objects.states).features.find(d => d.properties.name === "Sandusky");

    // Convert GeoJSON to SVG path
    const svgPath = path(sandusky);

    // Convert SVG path to Three.js Shape
    const shape = transformSVGPathExposed(svgPath);
    const extrudeSettings = {
        depth: 50, // Increase this value to make California taller
        bevelEnabled: false
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}).catch(error => {
    console.error('Error loading or processing TopoJSON data:', error);
});

// Kameraeinstellungen
camera.position.set(0, 0, 100);  // Stellen Sie sicher, dass die Kamera auf die Szene ausgerichtet ist

// Render-Schleife
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();