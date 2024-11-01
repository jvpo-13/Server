function pointsPathCV() {
    const pointsPath = new THREE.CurvePath();
    const line1 = new THREE.LineCurve3(
      new THREE.Vector3(100, -35, 530),
      new THREE.Vector3(470, -35, 530)
    );
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(470, -35, 530),
      new THREE.Vector3(588, -35, 530),
      new THREE.Vector3(588, -35, 400),
      new THREE.Vector3(588, -35, 400)
    );
    const line2 = new THREE.LineCurve3(
      new THREE.Vector3(588, -35, 400),
      new THREE.Vector3(588, -35, -250)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(588, -35, -250),
      new THREE.Vector3(588, -35, -380),
      new THREE.Vector3(378, -35, -380),
      new THREE.Vector3(378, -35, -250)
    );
    const line3 = new THREE.LineCurve3(
      new THREE.Vector3(378, -35, -250),
      new THREE.Vector3(378, -35, -120)
    );
    const line4 = new THREE.LineCurve3(
      new THREE.Vector3(378, -35, -120),
      new THREE.Vector3(378, -35, -250)
    );
    const curve3 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(378, -35, -250),
      new THREE.Vector3(378, -35, -380),
      new THREE.Vector3(588, -35, -380),
      new THREE.Vector3(588, -35, -250)
    );
    const line5 = new THREE.LineCurve3(
      new THREE.Vector3(588, -35, -250),
      new THREE.Vector3(588, -35, 400)
    );
    const curve4 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(588, -35, 400),
      new THREE.Vector3(588, -35, 400),
      new THREE.Vector3(588, -35, 530),
      new THREE.Vector3(470, -35, 530)
    );
    const line6 = new THREE.LineCurve3(
      new THREE.Vector3(470, -35, 530),
      new THREE.Vector3(100, -35, 530)
    );
  
    pointsPath.add(line1);
    pointsPath.add(curve1);
    pointsPath.add(line2);
    pointsPath.add(curve2);
    pointsPath.add(line3);
    pointsPath.add(line4);
    pointsPath.add(curve3);
    pointsPath.add(line5);
    pointsPath.add(curve4);
    pointsPath.add(line6);
  
    return pointsPath;
  }
  
  function pointsPathCA1() {
    const pointsPath = new THREE.CurvePath();
    const line1 = new THREE.LineCurve3(
      new THREE.Vector3(100, -35, 530),
      new THREE.Vector3(-470, -35, 530)
    );
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-470, -35, 530),
      new THREE.Vector3(-588, -35, 530),
      new THREE.Vector3(-588, -35, 400),
      new THREE.Vector3(-588, -35, 400)
    );
    const line2 = new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, 400),
      new THREE.Vector3(-588, -35, -120)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-588, -35, -120),
      new THREE.Vector3(-588, -35, -230),
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-470, -35, -230)
    );
    const line3 = new THREE.LineCurve3(
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-400, -35, -230)
    );
  
    pointsPath.add(line1);
    pointsPath.add(curve1);
    pointsPath.add(line2);
    pointsPath.add(curve2);
    pointsPath.add(line3);
  
    return pointsPath;
  }
  
  function pointsPathCL() {
    const pointsPath = new THREE.CurvePath();
    const line1 = new THREE.LineCurve3(
      new THREE.Vector3(-400, -35, -230),
      new THREE.Vector3(80, -35, -230)
    );
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(80, -35, -230),
      new THREE.Vector3(280, -35, -230),
      new THREE.Vector3(280, -35, 50),
      new THREE.Vector3(80, -35, 40)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(80, -35, 40),
      new THREE.Vector3(55, -35, 38),
      new THREE.Vector3(45, -35, 32),
      new THREE.Vector3(40, -35, 30)
    );
    const curve10 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(80, -35, -230),
      new THREE.Vector3(280, -35, -230),
      new THREE.Vector3(280, -35, 100),
      new THREE.Vector3(40, -35, 30)
    );
    const line2 = new THREE.LineCurve3(
      new THREE.Vector3(40, -35, 30),
      new THREE.Vector3(-90, -35, -45)
    );
    //volta
    const line3 = new THREE.LineCurve3(
      new THREE.Vector3(-90, -35, -45),
      new THREE.Vector3(40, -35, 30)
    );
    const curve3 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(40, -35, 30),
      new THREE.Vector3(45, -35, 32),
      new THREE.Vector3(55, -35, 38),
      new THREE.Vector3(80, -35, 40)
    );
    const curve4 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(80, -35, 40),
      new THREE.Vector3(280, -35, 50),
      new THREE.Vector3(280, -35, -230),
      new THREE.Vector3(80, -35, -230)
    );
    const line4= new THREE.LineCurve3(
      new THREE.Vector3(80, -35, -230),
      new THREE.Vector3(-400, -35, -230)
    );
  
    pointsPath.add(line1);
    pointsPath.add(curve1);
    pointsPath.add(curve2);
    pointsPath.add(line2);
    pointsPath.add(line3);
    pointsPath.add(curve3);
    pointsPath.add(curve4);
    pointsPath.add(line4);
  
    return pointsPath;
  }
  
  function pointsPathCA2() {
    const pointsPath = new THREE.CurvePath();
    const line1 = new THREE.LineCurve3(
      new THREE.Vector3(-400, -35, -230),
      new THREE.Vector3(-470, -35, -230)
    );
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-588, -35, -230),
      new THREE.Vector3(-588, -35, -330)
    );
    const line2 = new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, -330),
      new THREE.Vector3(-588, -35, -420)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -530),
      new THREE.Vector3(-488, -35, -530)
    );
    const curve3 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-488, -35, -530),
      new THREE.Vector3(-588, -35, -530),
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -420)
    );
    const line3 = new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, 400)
    );
    const line4= new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, 400),
      new THREE.Vector3(-588, -35, -120)
    );
    const curve4 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-588, -35, -120),
      new THREE.Vector3(-588, -35, -230),
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-470, -35, -230)
    );
    const curve5 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-470, -35, -230),
      new THREE.Vector3(-588, -35, -230),
      new THREE.Vector3(-588, -35, -330)
    );
    const line5 = new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, -330),
      new THREE.Vector3(-588, -35, -420)
    );
    const curve6 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -530),
      new THREE.Vector3(-488, -35, -530)
    );
    const line6 = new THREE.LineCurve3(
      new THREE.Vector3(-488, -35, -530),
      new THREE.Vector3(-308, -35, -530)
    );
    const curve7 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-308, -35, -530),
      new THREE.Vector3(-258, -35, -530),
      new THREE.Vector3(-168, 0, -530),
      new THREE.Vector3(-158, 5, -530)
    );
    const line7 = new THREE.LineCurve3(
      new THREE.Vector3(-158, 5, -530),
      new THREE.Vector3(88, 120, -530)
    );
    const curve8 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(88, 120, -530),
      new THREE.Vector3(118, 135, -530),
      new THREE.Vector3(138, 145, -530),
      new THREE.Vector3(238, 145, -530)
    );
    const line8 = new THREE.LineCurve3(
      new THREE.Vector3(238, 145, -530),
      new THREE.Vector3(338, 145, -530)
    );
    
    
  
    pointsPath.add(line1);
    pointsPath.add(curve1);
    pointsPath.add(line2);
    pointsPath.add(curve2);
    pointsPath.add(curve3);
    pointsPath.add(line3);
    pointsPath.add(line4);
    pointsPath.add(curve4);
    pointsPath.add(curve5);
    pointsPath.add(line5);
    pointsPath.add(curve6);
    pointsPath.add(line6);
    pointsPath.add(curve7);
    pointsPath.add(line7);
    pointsPath.add(curve8);
    pointsPath.add(line8);
  
    return pointsPath;
  }
  
  function pointsPathCA3() {
    const pointsPath = new THREE.CurvePath();
    const line1 = new THREE.LineCurve3(
      new THREE.Vector3(338, 145, -530),
      new THREE.Vector3(238, 145, -530)
    );
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(238, 145, -530),
      new THREE.Vector3(138, 145, -530),
      new THREE.Vector3(118, 135, -530),
      new THREE.Vector3(88, 120, -530)
    );
    const line2 = new THREE.LineCurve3(
      new THREE.Vector3(88, 120, -530),
      new THREE.Vector3(-158, 5, -530)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-158, 5, -530),
      new THREE.Vector3(-168, 0, -530),
      new THREE.Vector3(-258, -35, -530),
      new THREE.Vector3(-308, -35, -530)
    );
    const line3 = new THREE.LineCurve3(
      new THREE.Vector3(-308, -35, -530),
      new THREE.Vector3(-488, -35, -530)
    );
    const curve3 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-488, -35, -530),
      new THREE.Vector3(-588, -35, -530),
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, -420)
    );
    const line4 = new THREE.LineCurve3(
      new THREE.Vector3(-588, -35, -420),
      new THREE.Vector3(-588, -35, 400)
    );
    const curve5 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-588, -35, 400),
      new THREE.Vector3(-588, -35, 400),
      new THREE.Vector3(-588, -35, 530),
      new THREE.Vector3(-470, -35, 530)
    );
    const line6 = new THREE.LineCurve3(
      new THREE.Vector3(-470, -35, 530),
      new THREE.Vector3(100, -35, 530)
    );
    
    pointsPath.add(line1);
    pointsPath.add(curve1);
    pointsPath.add(line2);
    pointsPath.add(curve2);
    pointsPath.add(line3);
    pointsPath.add(curve3);
    pointsPath.add(line4);
    pointsPath.add(curve5);
    pointsPath.add(line6);
  
    return pointsPath;
  }