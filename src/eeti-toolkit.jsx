import { useState, useMemo, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// EETI TOOLKIT v3 — Embedded, Embodied & Tangible Interactions
// Dark editorial + CLI aesthetic
// Multi-select, dependency engine, experience-type entry
// ═══════════════════════════════════════════════════════════════

// ── CARD DATA ──────────────────────────────────────────────────
const CARDS = [
  // SCENARIO / CONTEXT (pink)
  { id:"standing",cat:"scenario",name:"Standing",sub:"Context",img:"scenario_standing.png",desc:"User is upright, hands potentially free. Favors glanceable outputs and quick gestural inputs.",pros:["Hands free for interaction","Natural for wearables"],cons:["Limited attention span","Movement introduces noise"],considerations:["Keep interactions brief","Prefer haptic/audio over visual for alerts"] },
  { id:"sitting",cat:"scenario",name:"Sitting",sub:"Context",img:"scenario_sitting.png",desc:"User is seated — at a desk, in transit, or relaxing. Allows longer engagement and finer motor control.",pros:["Extended interaction possible","Stable hand position"],cons:["May compete with other seated tasks"],considerations:["Can support more complex inputs","Consider ergonomic reach zones"] },
  { id:"indoor",cat:"scenario",name:"Indoor",sub:"Context",img:"scenario_indoor.png",desc:"Controlled environment with predictable lighting, temperature, and connectivity.",pros:["Reliable WiFi/power access","Controlled ambient conditions"],cons:["Less need for ruggedization"],considerations:["Can use ambient sensors effectively","Power outlets likely available"] },
  { id:"outdoor",cat:"scenario",name:"Outdoor",sub:"Context",img:"scenario_outdoor.png",desc:"Variable conditions — weather, lighting, noise. Demands robustness and visibility.",pros:["GPS meaningful","Solar power viable"],cons:["Screen glare","Environmental interference","Moisture/dust risk"],considerations:["Weatherproofing required","High-contrast displays preferred","Consider glove compatibility"] },
  { id:"mobile",cat:"scenario",name:"Mobile",sub:"Context",img:"scenario_mobile.png",desc:"User is in motion — walking, cycling, commuting. Attention is divided.",pros:["Captures real-time movement data"],cons:["Vibration/movement noise","Split attention"],considerations:["Minimize visual dependency","Favor haptic + audio feedback","One-hand or no-hand operation"] },
  { id:"stationary",cat:"scenario",name:"Stationary",sub:"Context",img:"scenario_stationary.png",desc:"Fixed installation — kiosk, wall-mounted, or embedded in furniture/architecture.",pros:["No battery constraints","Can be larger","Stable mounting"],cons:["Limited to one location"],considerations:["Can use wired power/network","Consider viewing distance","Public vs private context"] },
  { id:"wearable",cat:"scenario",name:"Wearable",sub:"Media",img:"scenario_wearble.png",desc:"Worn on body — wrist, head, torso, finger. Always-on, always-with-you.",pros:["Continuous sensing","Personal/private"],cons:["Size severely constrained","Comfort critical","Battery limited"],considerations:["Minimize weight","Skin contact enables biometrics","Social acceptability matters"] },
  { id:"vehicle",cat:"scenario",name:"Vehicle",sub:"Media",img:"scenario_vehicle.png",desc:"In-car, bicycle, or other vehicle context. Safety-critical, eyes-busy.",pros:["12V power available","GPS meaningful"],cons:["Driver distraction risk","Vibration"],considerations:["Voice/haptic over visual","Large simple controls","Hands-free operation essential"] },
  { id:"social",cat:"scenario",name:"Social",sub:"Context",img:"scenario_social.png",desc:"Multi-person setting — meeting, party, public space. Privacy and discretion matter.",pros:["Shared experiences possible"],cons:["Privacy concerns","Noise interference","Social judgment"],considerations:["Discreet interactions preferred","Consider bystander experience","Audio output may disturb others"] },
  { id:"individual",cat:"scenario",name:"Individual",sub:"Context",img:"scenario_individual.png",desc:"Solo use — personal device, private moment. Full attention possible.",pros:["Full user attention","No privacy constraints"],cons:["No shared interaction"],considerations:["Can use any output modality","Personal data OK","Richer interaction possible"] },
  { id:"phone",cat:"scenario",name:"Smart Phone",sub:"Media",img:"scenario_phone.png",desc:"Companion device or phone-connected experience. Leverages phone's capabilities.",pros:["Rich display via phone","Phone handles connectivity"],cons:["Dependency on phone","Pairing complexity"],considerations:["BLE likely needed","Consider phone as hub","App companion design"] },
  { id:"lying",cat:"scenario",name:"Lying Down",sub:"Context",img:"scenario_lying.png",desc:"User is horizontal — in bed, on a couch, or on the floor. Relaxed posture, often one-handed.",pros:["Relaxed, extended engagement possible","Good for ambient/calm interactions"],cons:["Screen orientation changes","One hand typically free","Risk of sleep/drowsiness"],considerations:["Auto-rotate or orientation lock option","Proximity sensor prevents pocket/face triggers","Minimize required precision — larger touch targets"] },
  { id:"kitchen",cat:"scenario",name:"Kitchen",sub:"Context",img:"scenario_kitchen.png",desc:"Food preparation context. Wet or greasy hands, heat and steam, time-critical tasks.",pros:["High engagement — recipes, timers, music","Frequent repeat interactions"],cons:["Wet/greasy hands defeat touchscreens","Splashes, heat, humidity","Divided attention"],considerations:["Voice or large physical buttons over touch","IP54+ splash resistance minimum","High-contrast display for low-light countertops"] },
  { id:"healthcare",cat:"scenario",name:"Healthcare",sub:"Context",img:"scenario_healthcare.png",desc:"Medical or clinical environment. Gloved hands, strict hygiene, regulatory oversight.",pros:["High-value use case","Critical feedback loops matter enormously"],cons:["Gloves block capacitive touch","Must withstand disinfectant wipes","IEC 60601 regulatory requirements"],considerations:["Use physical buttons or ultrasonic touch for gloved operation","Sealed IP65 enclosure for cleaning","Patient-adjacent devices need IEC 60601-1 certification"] },
  { id:"emergency",cat:"scenario",name:"Emergency",sub:"Context",img:"scenario_emergency.png",desc:"Safety-critical, high-stress context. Time pressure, noise, PPE, cognitive overload.",pros:["Huge impact when interaction works reliably","Forces clarity and simplicity"],cons:["Cognitive overload risk","PPE limits touch and hearing","No tolerance for errors or ambiguity"],considerations:["Redundant feedback: visual + audio + haptic together","Large unambiguous controls — no small targets","Fail-safe default: safest state on power loss or timeout"] },

  // INPUT / GESTURE (peach)
  { id:"tap",cat:"gesture",name:"Tap",sub:"Gesture",img:"input_tap.png",desc:"Single touch contact. The most basic and universal interaction.",pros:["Universally understood","Fast","Low error rate"],cons:["Limited expressiveness","Requires touch surface"],considerations:["Needs feedback confirmation","Consider touch target size >44px equivalent"] },
  { id:"doubletap",cat:"gesture",name:"Double Tap",sub:"Gesture",img:"input_doubletap.png",desc:"Two rapid touches. Adds a second layer of meaning to the same surface.",pros:["Extends tap vocabulary"],cons:["Timing-sensitive","Delays single-tap response"],considerations:["Needs clear timing window","Not discoverable without instruction"] },
  { id:"press",cat:"gesture",name:"Press",sub:"Gesture",img:"input_press.png",desc:"Sustained contact. Duration creates a distinct meaning from tap.",pros:["Distinct from tap","Can trigger progressive actions"],cons:["Slower","Ambiguous threshold"],considerations:["Need visual/haptic feedback for threshold","Consider press-and-hold duration"] },
  { id:"drag",cat:"gesture",name:"Drag",sub:"Gesture",img:"input_drag.png",desc:"Touch and move. Maps well to spatial manipulation.",pros:["Intuitive for positioning","Continuous control"],cons:["Requires screen/surface","Occlusion by finger"],considerations:["Need clear drag handles","Consider momentum/inertia"] },
  { id:"tilt",cat:"gesture",name:"Tilt",sub:"Gesture",img:"input_tilt.png",desc:"Device or body angle change. Uses accelerometer data.",pros:["Hands-free possible","Natural motion"],cons:["Accidental triggering","Requires accelerometer"],considerations:["Needs dead zones to prevent false triggers","Calibration may be needed"] },
  { id:"rotate",cat:"gesture",name:"Rotate",sub:"Gesture",img:"input_rotate.png",desc:"Twisting motion — like turning a dial or rotating the wrist.",pros:["Natural for value adjustment","Continuous range"],cons:["Hard on flat screens","Needs gyroscope"],considerations:["Map rotation direction to value direction intuitively","Consider detent/snap points"] },
  { id:"multitouch",cat:"gesture",name:"Multi Touch",sub:"Gesture",img:"input_multitouch.png",desc:"Two or more simultaneous contact points. Enables pinch, zoom, rotate on surface.",pros:["Rich interaction vocabulary"],cons:["Requires multitouch surface","Not always discoverable"],considerations:["Pinch-to-zoom is expected","Consider three-finger gestures carefully"] },
  { id:"pitch",cat:"gesture",name:"Pitch",sub:"Gesture",img:"input_pitch.png",desc:"Two-finger spread/pinch. Primarily for scaling content.",pros:["Standard for zoom","Intuitive scaling"],cons:["Requires multitouch"],considerations:["Maintain center point during zoom","Set min/max bounds"] },
  { id:"shake",cat:"gesture",name:"Shake",sub:"Gesture",img:"input_shake.png",desc:"Rapid back-and-forth motion. Often used for undo or reset.",pros:["Dramatic, memorable","No surface needed"],cons:["Accidental trigger risk","Requires accelerometer"],considerations:["High threshold to avoid false positives","Provide undo for the undo"] },
  { id:"push",cat:"gesture",name:"Push",sub:"Gesture",img:"input_push.png",desc:"Force applied away from user. Physical, embodied interaction.",pros:["Satisfying physical feedback"],cons:["Needs mechanical design"],considerations:["Spring return or latching?","Force feedback important"] },
  { id:"pull",cat:"gesture",name:"Pull",sub:"Gesture",img:"input_pull.png",desc:"Force applied toward user. Paired with push for bidirectional control.",pros:["Intuitive for retrieval/activation"],cons:["Mechanical complexity"],considerations:["Consider cord/handle ergonomics","Resistance profile matters"] },
  { id:"lift",cat:"gesture",name:"Lift",sub:"Gesture",img:"input_lift.png",desc:"Picking up or raising an object. Triggers on removal from surface.",pros:["Natural wake trigger","Weight-based detection possible"],cons:["Needs weight/proximity sensor"],considerations:["Combine with accelerometer for lift detection","Consider put-down as paired action"] },
  { id:"drop",cat:"gesture",name:"Drop",sub:"Gesture",img:"input_drop.png",desc:"Releasing an object to fall. Can trigger on impact or release.",pros:["Dramatic gesture","Clear intention"],cons:["Risk of damage","Needs impact detection"],considerations:["Protect hardware from drops","Consider soft vs hard landing detection"] },
  { id:"hover",cat:"gesture",name:"Hover",sub:"Gesture",img:"input_hover.png",desc:"Proximity without contact. Hand or finger detected above surface.",pros:["Contactless interaction","Preview before commit"],cons:["Needs proximity sensor","Less precise"],considerations:["Useful for hygiene-sensitive contexts","Define hover-to-select transition clearly"] },
  { id:"swipe",cat:"gesture",name:"Swipe",sub:"Gesture",img:"gesture_swipe.png",desc:"Directional slide gesture — left, right, up, or down across a surface.",pros:["Fast navigation","Natural scrolling feel","Works on touch and touchpad"],cons:["Accidental triggers if threshold too low","Not glove-friendly","Requires surface area"],considerations:["Velocity + distance threshold prevents false triggers","Directional swipe = 4 distinct inputs","Avoid swipe-to-delete in safety-critical UIs"] },
  { id:"voicecmd",cat:"gesture",name:"Voice Command",sub:"Gesture",img:"gesture_voice.png",desc:"Speech used as an intentional input — wake word or push-to-talk command.",pros:["Fully hands-free","Natural for some users","Works at distance"],cons:["Noisy environments degrade accuracy","Privacy concerns with always-on mic","Latency"],considerations:["On-device wake word (Porcupine, Whisper tiny) avoids cloud dependency","Noise-cancelling MEMS mic is essential","Always provide a non-voice fallback"] },
  { id:"eyetrack",cat:"gesture",name:"Eye Tracking",sub:"Gesture",img:"gesture_eye.png",desc:"Gaze direction as input — dwell-to-select or saccade-based navigation.",pros:["Truly hands-free","Strong accessibility case","Natural gaze data for analytics"],cons:["Expensive sensors","Per-user calibration needed","Eye fatigue in extended use"],considerations:["Tobii or Eyeware modules for integration","Dwell time must balance speed vs false positives","Especially valuable for motor-impaired users"] },
  { id:"headnod",cat:"gesture",name:"Head Gesture",sub:"Gesture",img:"gesture_head.png",desc:"Head movement — nod, shake, tilt — detected via IMU or camera.",pros:["Hands-free","Low sensor cost via IMU on headworn device","Works with glasses"],cons:["Accidental triggers from natural movement","Very limited vocabulary","Socially awkward in public"],considerations:["Distinguish intentional vs ambient head motion with threshold tuning","Good fit for cycling helmets, hard hats, AR glasses","Nod/shake for yes/no is intuitive cross-culturally"] },
  { id:"breathgesture",cat:"gesture",name:"Breath Control",sub:"Gesture",img:"gesture_breath.png",desc:"Inhalation or exhalation detected as intentional control input via pressure sensor or mic.",pros:["Completely hands-free","Strong accessibility use case","Novel and distinctive feel"],cons:["Hygienic concerns in shared devices","User fatigue over long sessions","Very limited bandwidth"],considerations:["Puff-and-sip gives two-state toggle","Used in accessibility switches and musical controllers","Pressure sensor or directional mic near mouth for detection"] },

  // INPUT / CONTROL (peach)
  { id:"button",cat:"control",name:"Button",sub:"Control",img:"input_button.png",desc:"Physical momentary switch. Discrete on/off with tactile feedback.",pros:["Clear tactile feedback","Zero ambiguity","Works with gloves"],cons:["Limited to binary states","Takes physical space"],considerations:["Debouncing needed in firmware","Consider button travel distance and click force"] },
  { id:"jogwheel",cat:"control",name:"Jog Wheel",sub:"Control",img:"input_jogwheel.png",desc:"Rotary encoder. Endless rotation for scrolling, value adjustment.",pros:["Precise incremental control","Infinite range"],cons:["Requires mechanical space"],considerations:["Detented vs smooth rotation","Click-to-confirm adds utility"] },
  { id:"toggleswitch",cat:"control",name:"Toggle Switch",sub:"Control",img:"input_toggleswitch.png",desc:"Physical two-state switch. Position communicates current state.",pros:["State visible at a glance","Satisfying physical feel"],cons:["Binary only","Takes space"],considerations:["Position should map to on/off intuitively","Consider switch guard for critical functions"] },
  { id:"slider",cat:"control",name:"Slider",sub:"Control",img:"input_slider.png",desc:"Linear track with movable thumb. Maps position to value.",pros:["Visual position = value","Continuous range"],cons:["Takes linear space","Dust/moisture vulnerable"],considerations:["Consider detent positions","Motorized sliders can provide feedback"] },
  { id:"joystick",cat:"control",name:"Joystick",sub:"Control",img:"input_joystick.png",desc:"Multi-axis analog stick. X/Y positioning with optional Z-click.",pros:["2D control in one input","Intuitive directional"],cons:["Mechanical complexity","Drift over time"],considerations:["Dead zone calibration essential","Spring return vs position hold"] },
  { id:"keyboard",cat:"control",name:"Keyboard",sub:"Control",img:"input_keyboard.png",desc:"Array of labeled keys. Full text input capability.",pros:["Rich text input","Familiar"],cons:["Large footprint","Complex electronics"],considerations:["Membrane vs mechanical","Consider reduced key layouts for embedded"] },
  { id:"mouse",cat:"control",name:"Mouse",sub:"Control",img:"input_mouse.png",desc:"Pointing device with buttons. Desktop-paradigm interaction.",pros:["Precise cursor control","Familiar"],cons:["Requires flat surface","Not mobile-friendly"],considerations:["Optical vs trackball inside","DPI settings matter"] },
  { id:"trackball",cat:"control",name:"Track Ball",sub:"Control",img:"input_trackball.png",desc:"Stationary ball for cursor control. No surface movement needed.",pros:["Works in tight spaces","No surface needed"],cons:["Less intuitive than mouse"],considerations:["Ball size affects precision","Consider thumb vs finger operation"] },
  { id:"stylus",cat:"control",name:"Stylus",sub:"Control",img:"input_stylus.png",desc:"Pen-like input tool. Pressure sensitivity, tilt, precise positioning.",pros:["High precision","Natural for drawing"],cons:["Easy to lose","Requires compatible surface"],considerations:["Active vs passive stylus","Pressure levels matter for creative use"] },
  { id:"touchpad",cat:"control",name:"Touch Pad",sub:"Control",img:"input_touchpad.png",desc:"Flat capacitive surface. Gesture recognition without moving parts.",pros:["No mechanical wear","Supports gestures","Sealed surface"],cons:["No tactile feedback","Precision varies"],considerations:["Size determines gesture complexity","Consider haptic feedback addition"] },
  { id:"lever",cat:"control",name:"Lever",sub:"Control",img:"input_lever.png",desc:"Pivoting arm. Large mechanical range for analog control.",pros:["High force input possible","Very tactile"],cons:["Large mechanical space","Single axis"],considerations:["Spring return or detented positions","Consider leverage ratio"] },
  { id:"remotecontrol",cat:"control",name:"Remote Control",sub:"Control",img:"input_remote_control.png",desc:"Wireless handheld controller. Operates device from distance.",pros:["Distance operation","Familiar paradigm"],cons:["Losable","Needs own power"],considerations:["IR vs RF vs BLE","Button layout ergonomics critical"] },
  { id:"beacon",cat:"control",name:"Smart Beacon",sub:"Control",img:"input_beacon.png",desc:"Proximity-triggered BLE broadcaster. Location-aware interactions.",pros:["Passive triggering","Location context"],cons:["Needs receiving device","Battery replacement"],considerations:["Range calibration important","Consider beacon density for accuracy"] },
  { id:"rotarydial",cat:"control",name:"Rotary Dial",sub:"Control",img:"control_rotary.png",desc:"Absolute-position rotary encoder or potentiometer for dialing in a specific value.",pros:["Intuitive for frequency/channel/value selection","Position is visible without a screen","Satisfying tactile feel"],cons:["Limited range unless geared","Mechanical wear over time","Takes panel space"],considerations:["Optical encoders more reliable than mechanical","Soft-detent via haptic motor adds programmable feel","Common in audio, medical, and radio equipment"] },
  { id:"touchscreen",cat:"control",name:"Touchscreen",sub:"Control",img:"control_touchscreen.png",desc:"Capacitive glass surface enabling direct UI manipulation with finger or stylus.",pros:["Flexible — UI can change without hardware changes","Multi-touch and gesture support","Familiar to all users"],cons:["No tactile feedback","Fails with gloves or wet hands","Scratches and cracks"],considerations:["Projected capacitive (PCAP) for multi-touch","In-cell vs on-cell affects glass thickness","Add haptic actuator under glass to restore tactile feel"] },
  { id:"footpedal",cat:"control",name:"Foot Pedal",sub:"Control",img:"control_footpedal.png",desc:"Foot-operated switch or pedal — hands-free binary or continuous input.",pros:["Frees both hands completely","Large force available","Unambiguous intentional trigger"],cons:["User must be seated or stable","Footwear and flooring affects feel","Not universally accessible"],considerations:["Used in music, medical, industrial, and accessibility contexts","Simple microswitch is most reliable","Multiple pedals can be chorded for more commands"] },
  { id:"touchring",cat:"control",name:"Touch Ring",sub:"Control",img:"control_touchring.png",desc:"Capacitive touch ring around a button or dial — swipe and tap in a compact form.",pros:["5 inputs from one tiny component (tap + 4 directions)","No mechanical parts","Elegant product form"],cons:["Learning curve — not self-evident","Small target area","Requires careful sensitivity tuning"],considerations:["Common in smart speakers (Amazon Echo ring)","Combine center press + ring swipe for rich control","Direction + tap maps well to volume and select"] },

  // INPUT / SENSOR (peach)
  { id:"airsensor",cat:"sensor",name:"Air Sensor",sub:"Sensor",img:"input_airsensor.png",desc:"Measures air quality — particulates, VOCs, pollutants.",pros:["Health-relevant data","Growing demand"],cons:["Calibration drift","Sensor aging"],considerations:["Needs airflow access — don't seal it","Warm-up time before accurate readings"] },
  { id:"infrared",cat:"sensor",name:"Infrared Sensor",sub:"Sensor",img:"input_infraresdsensor.png",desc:"Detects IR radiation — heat signatures, remote signals, proximity.",pros:["Works in darkness","Non-contact"],cons:["Line-of-sight only","Ambient IR interference"],considerations:["Consider active vs passive IR","Lens design affects field of view"] },
  { id:"distance",cat:"sensor",name:"Distance Sensor",sub:"Sensor",img:"input_distancesensor.png",desc:"Measures distance to objects — ultrasonic, ToF, or IR ranging.",pros:["Non-contact measurement","Fast response"],cons:["Surface material affects accuracy","Limited range"],considerations:["ToF for precision, ultrasonic for range","Consider beam angle for detection zone"] },
  { id:"tempsensor",cat:"sensor",name:"Temperature Sensor",sub:"Sensor",img:"input_temperaruresensor.png",desc:"Measures ambient or contact temperature.",pros:["Simple, reliable","Low power"],cons:["Slow response to rapid changes","Self-heating errors"],considerations:["Thermistor vs thermocouple vs digital","Placement affects accuracy — avoid heat sources"] },
  { id:"vibsensor",cat:"sensor",name:"Vibration Sensor",sub:"Sensor",img:"input_vibrationsensor.png",desc:"Detects mechanical vibration — piezo or accelerometer-based.",pros:["Detects machine health","Tamper detection"],cons:["Needs mounting contact","Noise filtering required"],considerations:["Sample rate determines frequency detection","Consider FFT analysis for patterns"] },
  { id:"locationsensor",cat:"sensor",name:"Location Sensor",sub:"Sensor",img:"input_locationsensor.png",desc:"Determines geographic position — GPS, GLONASS, triangulation.",pros:["Absolute positioning","Outdoor navigation"],cons:["No indoor coverage","Power hungry","Slow first fix"],considerations:["Combine with accelerometer for dead reckoning","A-GPS reduces fix time"] },
  { id:"lightsensor",cat:"sensor",name:"Light Sensor",sub:"Sensor",img:"input_lightsensor.png",desc:"Measures ambient light levels — LDR, photodiode, or lux sensor.",pros:["Low power","Simple","Auto-brightness"],cons:["Spectral response varies"],considerations:["Placement critical — avoid shadowing","Consider UV/IR filtering needs"] },
  { id:"colorsensor",cat:"sensor",name:"Color Sensor",sub:"Sensor",img:"input_colorsensor.png",desc:"Detects color of surfaces or light — RGB or spectral analysis.",pros:["Material identification","Sorting applications"],cons:["Needs controlled lighting","Close range"],considerations:["White LED illumination needed for surfaces","Calibrate against known references"] },
  { id:"motionsensor",cat:"sensor",name:"Motion Sensor",sub:"Sensor",img:"input_motionsensor.png",desc:"Detects movement — PIR, radar, or accelerometer-based.",pros:["Low power wake trigger","Wide detection area"],cons:["Cannot identify who/what","False triggers from heat sources"],considerations:["PIR for presence, accelerometer for device motion","Fresnel lens design shapes detection zone"] },
  { id:"healthsensor",cat:"sensor",name:"Health Sensor",sub:"Sensor",img:"input_healthsensor.png",desc:"Biometric measurement — heart rate, SpO2, skin conductance, temperature.",pros:["Personal health data","Continuous monitoring"],cons:["Skin contact required","Motion artifacts"],considerations:["Green LED PPG for heart rate","Ensure proper skin contact pressure","Medical vs wellness accuracy requirements"] },
  { id:"weightsensor",cat:"sensor",name:"Weight Sensor",sub:"Sensor",img:"input_weightsensor.png",desc:"Measures force/weight — load cells, strain gauges, FSRs.",pros:["Simple, reliable","Analog sensing"],cons:["Calibration needed","Temperature sensitive"],considerations:["Load cell for precision, FSR for detect-only","Consider overload protection"] },
  { id:"energysensor",cat:"sensor",name:"Energy Sensor",sub:"Sensor",img:"input_energysensor.png",desc:"Monitors power consumption — current sensing, voltage monitoring.",pros:["System health data","Power optimization"],cons:["Additional circuit complexity"],considerations:["Hall effect for non-invasive current sensing","Consider power factor for AC"] },
  { id:"soundsensor",cat:"sensor",name:"Sound Sensor",sub:"Sensor",img:"input_soundsensor.png",desc:"Captures audio — MEMS microphone, electret, or piezo.",pros:["Voice commands","Environmental monitoring"],cons:["Privacy concerns","Noise filtering needed"],considerations:["MEMS mics are tiny and cheap","Consider array for directionality","Always-listening vs wake-word"] },
  { id:"humidity",cat:"sensor",name:"Humidity Sensor",sub:"Sensor",img:"input_humiditysensor.png",desc:"Measures relative humidity — capacitive or resistive.",pros:["Low cost","Important for comfort/agriculture"],cons:["Slow response","Contamination risk"],considerations:["Often combined with temperature sensor","Avoid direct water contact"] },
  { id:"gassensor",cat:"sensor",name:"Gas Sensor",sub:"Sensor",img:"input_gassensor.png",desc:"Detects specific gases — CO2, CO, methane, VOCs.",pros:["Safety critical","Environmental monitoring"],cons:["Power hungry","Cross-sensitivity","Warm-up time"],considerations:["Electrochemical for precision, MOS for broad detection","Requires airflow access"] },
  { id:"watersensor",cat:"sensor",name:"Water Property",sub:"Sensor",img:"input_waterpropertysensor.png",desc:"Measures water characteristics — pH, TDS, turbidity, conductivity.",pros:["Water quality monitoring"],cons:["Probe maintenance","Calibration critical"],considerations:["Electrodes degrade — plan for replacement","Isolate electronics from water exposure"] },
  { id:"barometric",cat:"sensor",name:"Barometric",sub:"Sensor",img:"sensor_barometric.png",desc:"Atmospheric pressure sensor for altitude estimation and weather-trend detection.",pros:["Low power","~10cm altitude resolution","Detects weather changes hours ahead"],cons:["Needs vent hole in enclosure","Temperature-induced drift","Affected by wind gusts"],considerations:["BMP390 or MS5611 for high accuracy","Seal vent with hydrophobic Gore-Tex membrane to block liquid","Indoor use: floor-level detection in multi-storey buildings"] },
  { id:"compass",cat:"sensor",name:"Compass",sub:"Sensor",img:"sensor_compass.png",desc:"Magnetometer giving absolute heading relative to magnetic north.",pros:["Absolute orientation — no drift","Low power","Pairs well with accelerometer for tilt-compensated heading"],cons:["Requires figure-8 calibration","Magnetic interference from motors, speakers, batteries","Hard and soft iron distortion"],considerations:["LSM303AGR integrates accel + mag on one die","Keep 5cm+ from motors and large inductors","Fuse with gyroscope for stable heading under vibration"] },
  { id:"uvsensor",cat:"sensor",name:"UV Sensor",sub:"Sensor",img:"sensor_uv.png",desc:"Ultraviolet radiation level measurement — sun exposure index and sterilisation confirmation.",pros:["Direct UV index output","Health monitoring use case","Low cost"],cons:["Requires transparent window in enclosure","Sensitive to angle of incidence","Limited use-case breadth"],considerations:["VEML6075 or LTR390 for UV-A and UV-B separately","UV sterilisation confirmation in medical/lab devices","Pair with light sensor for full environmental picture"] },
  { id:"rainsensor",cat:"sensor",name:"Rain Sensor",sub:"Sensor",img:"sensor_rain.png",desc:"Precipitation or moisture-on-surface detection — capacitive or resistive.",pros:["Automatic weather response","Low cost","Very low idle power"],cons:["Must be exposed — integration challenge","Fouling from dust and pollen","Capacitance varies with sensor material"],considerations:["Capacitive type more reliable than resistive long-term","Pair with barometric for fuller weather awareness","Used in outdoor IoT, auto-retracting awnings, wearable weather alerts"] },
  { id:"proximitysensor",cat:"sensor",name:"Proximity",sub:"Sensor",img:"sensor_proximity.png",desc:"Short-range presence detection — IR or capacitive. Screen wake, hand approach, object detection.",pros:["Low power","No physical contact required","Enables intelligent screen on/off"],cons:["Range limited to ~10cm for most modules","Reflective surfaces cause false positives"],considerations:["VCNL4040 or APDS-9960 (also does gesture)","Used in phones to turn off screen during calls","Capacitive proximity detects hand 2-5cm from device surface"] },

  // INPUT / CAMERA (peach)
  { id:"codetracking",cat:"camera",name:"Code Tracking",sub:"Camera",img:"input_codetracking.png",desc:"Barcode/QR scanning via camera. Links physical to digital.",pros:["Low cost","Rich data encoding"],cons:["Needs camera + processing","Lighting dependent"],considerations:["QR codes are more robust than barcodes","Consider autofocus speed for scanning UX"] },
  { id:"gazetracking",cat:"camera",name:"Gaze Tracking",sub:"Camera",img:"input_gazetracking.png",desc:"Eye tracking via IR cameras. Knows where the user is looking.",pros:["Hands-free input","Attention awareness"],cons:["Expensive","Calibration per user","Privacy concerns"],considerations:["Near-IR illumination needed","Consider glasses/contacts compatibility"] },
  { id:"headtracking",cat:"camera",name:"Head Tracking",sub:"Camera",img:"input_headtracking.png",desc:"Tracks head position and rotation. Nod, shake, look-direction.",pros:["Hands-free control","Natural gestures"],cons:["Camera or IMU required","Limited vocabulary"],considerations:["Nod/shake for yes/no is cross-cultural","Combine with gaze for rich interaction"] },
  { id:"motiontracking",cat:"camera",name:"Motion Tracking",sub:"Camera",img:"input_motiontracking.png",desc:"Full body or limb tracking via camera or IMU array.",pros:["Rich spatial data","Activity recognition"],cons:["Processing intensive","Privacy concerns"],considerations:["Depth cameras improve accuracy","Edge processing for privacy"] },
  { id:"handtracking",cat:"camera",name:"Hand Tracking",sub:"Camera",img:"input_handtracking.png",desc:"Tracks hand position, finger pose, and gestures in 3D space.",pros:["Natural gestural input","No wearable needed"],cons:["Occlusion issues","Processing heavy"],considerations:["Depth sensor improves robustness","Define clear gesture vocabulary to avoid confusion"] },
  { id:"fingerprint",cat:"camera",name:"Finger Print",sub:"Camera",img:"input_fingerprint.png",desc:"Biometric identification via fingerprint scanning.",pros:["Secure authentication","Fast","Personal"],cons:["Wet/dirty fingers fail","Spoofing risk"],considerations:["Capacitive vs optical vs ultrasonic","Consider fallback authentication method"] },
  { id:"depthcamera",cat:"camera",name:"Depth Camera",sub:"Camera",img:"camera_depth.png",desc:"3D depth sensing via ToF, structured light, or stereo — full spatial scene geometry.",pros:["3D object dimensions and position","Enables robust gesture recognition","Works in low light for presence detection"],cons:["High power and compute requirements","Large data rate","Costly compared to 2D camera"],considerations:["Intel RealSense or OAK-D for rich dev","VL53L5CX for simple 8x8 ToF zone detection","Pair with ML model for hand or body pose estimation"] },
  { id:"thermalcamera",cat:"camera",name:"Thermal Camera",sub:"Camera",img:"camera_thermal.png",desc:"Infrared thermal imaging — heat maps, presence detection, temperature monitoring without visible light.",pros:["Works in complete darkness","No personally-identifiable imagery — privacy-safe","Maps temperature across a scene"],cons:["Very low resolution at low cost","Export-controlled in some regions","High cost for quality resolution"],considerations:["MLX90640 for 32×24 low-cost array","FLIR Lepton module for higher resolution","Privacy-safe people counting alternative to RGB cameras"] },
  { id:"cam360",cat:"camera",name:"360° Camera",sub:"Camera",img:"camera_360.png",desc:"Omnidirectional imaging via dual fisheye lenses stitched into equirectangular output.",pros:["Full scene coverage — no pointing required","VR and spatial content creation","No missed angles"],cons:["High compute for stitching","Large file sizes","Visible stitch seam at nadir/zenith"],considerations:["On-device stitching needs a GPU or NPU","Good for telepresence robots, dashcams, meeting rooms","Sony IMX377 dual-lens for quality"] },
  { id:"objectrecog",cat:"camera",name:"Object Recognition",sub:"Camera",img:"camera_objrecog.png",desc:"On-device ML classification and bounding-box detection of objects, faces, or scene content.",pros:["Semantic understanding of environment","Enables touchless context-aware interaction","Local inference — no cloud required"],cons:["Compute-intensive — needs NPU or GPU","Requires training data and model tuning","Accuracy vs speed tradeoff on edge hardware"],considerations:["TensorFlow Lite or ONNX Runtime on MCU","Coral Edge TPU or Apple Neural Engine for fast inference","Keep inference local for privacy-sensitive scenes — never upload"] },

  // OUTPUT / DISPLAY (blue)
  { id:"lcd",cat:"display",name:"LCD/LED Screen",sub:"Display",img:"output_lcdledscreen.png",desc:"Full-color active display. Rich visual output with backlighting.",pros:["Full color","Dynamic content","High brightness"],cons:["Power hungry","Fragile","Glare"],considerations:["Size vs resolution tradeoff","Consider sunlight readability","Touch integration adds cost"] },
  { id:"eink",cat:"display",name:"E-ink Screen",sub:"Display",img:"output_einkscreen.png",desc:"Bistable display — holds image without power. Paper-like readability.",pros:["Ultra low power","Excellent readability","No backlight glare"],cons:["Slow refresh","Limited/no color","No video"],considerations:["Perfect for status displays","Partial refresh for faster updates","Deep black levels, high contrast"] },
  { id:"segment",cat:"display",name:"Segment Screen",sub:"Display",img:"output_segementscreen.png",desc:"Seven-segment or custom segment display. Numbers and simple icons.",pros:["Very low power","High visibility","Simple driver"],cons:["Limited character set","No graphics"],considerations:["LED segments for brightness, LCD for power saving","Custom segments can show icons"] },
  { id:"flexscreen",cat:"display",name:"Flexible Screen",sub:"Display",img:"output_flexiblescreen.png",desc:"Bendable OLED or e-paper. Conforms to curved surfaces.",pros:["Curved/organic form factors","Thin, lightweight"],cons:["Expensive","Limited sizes","Durability concerns"],considerations:["Consider bend radius limits","Connector design for flex zone"] },
  { id:"transparentscreen",cat:"display",name:"Transparent Screen",sub:"Display",img:"output_trasparentscreen.png",desc:"See-through display. Overlays digital on physical world.",pros:["Augmented reality without headset","Preserves visual context"],cons:["Low contrast","Very expensive","Limited brightness"],considerations:["Best with controlled background","Consider when transparent vs opaque mode"] },
  { id:"ledmatrix",cat:"display",name:"LED Matrix",sub:"Display",img:"display_ledmatrix.png",desc:"Grid of individually addressable RGB LEDs — scrolling text, animations, ambient light art.",pros:["Very low cost","High brightness — readable outdoors","Flexible shapes and sizes"],cons:["Low pixel resolution","Power draw scales with brightness","Individual LEDs visible at close range"],considerations:["WS2812B for full RGB, APA102 for high-speed refresh","Diffuser panel over LEDs creates even, professional look","Excellent for status displays, signage, ambient art installations"] },
  { id:"projector",cat:"display",name:"Projector",sub:"Display",img:"display_projector.png",desc:"Throws a display image onto any surface — walls, tables, hands, objects.",pros:["Dynamic display without a fixed screen","Surface-agnostic — projects onto anything","Enables large image in small device"],cons:["Ambient light washes out image","Heat generation in small enclosures","Requires alignment and keystone correction"],considerations:["DLP pico projectors for embedded use (Texas Instruments DLP2000)","Throw ratio determines minimum projection distance","Pair with depth camera for interactive projection mapping"] },
  { id:"hud",cat:"display",name:"HUD / AR Overlay",sub:"Display",img:"display_hud.png",desc:"Head-up display or AR optical overlay — information in the user's direct line of sight.",pros:["Information visible without looking away from task","Hands-free and eyes-on-task","Spatial context for information"],cons:["Expensive waveguide or combiner optics","Eye strain in extended use","Safety risk if not dimmable"],considerations:["Waveguide optics for true see-through AR","Simple half-mirror combiner glass is cheaper and well-proven","Always include off/dim mode — never force HUD on"] },

  // OUTPUT / FEEDBACK (blue)
  { id:"light",cat:"feedback",name:"Light",sub:"Feedback",img:"output_light.png",desc:"LED indicators — single color, RGB, or addressable strips.",pros:["Low power","Instant","Visible at distance"],cons:["Limited information density","Can be missed"],considerations:["Color meaning must be learned or universal","Consider color-blind accessibility","Breathing/pulsing patterns add meaning"] },
  { id:"vibration",cat:"feedback",name:"Vibration",sub:"Feedback",img:"output_vibration.png",desc:"Haptic vibration — ERM, LRA, or piezo actuators.",pros:["Private/personal","Works when eyes busy","Tactile confirmation"],cons:["Power draw","Noise","Limited vocabulary"],considerations:["LRA for precise patterns, ERM for simple buzz","Vibration patterns need learning","Consider body location for perception"] },
  { id:"sound",cat:"feedback",name:"Sound",sub:"Feedback",img:"output_sound.png",desc:"Audio output — beeps, tones, speech, or spatial audio.",pros:["Rich information","Attention-grabbing","Language possible"],cons:["Disturbs others","Ambient noise masking"],considerations:["Consider bone conduction for private audio","Spatial audio requires multiple speakers","Earcon design: short, distinct, meaningful"] },
  { id:"temperature",cat:"feedback",name:"Temperature",sub:"Feedback",img:"output_temperature.png",desc:"Thermal feedback — Peltier elements for hot/cold sensation.",pros:["Unique modality","Emotional associations"],cons:["Slow response","Power intensive","Safety risk"],considerations:["Temperature range 18-42°C safe zone","Warm = positive, cool = alert is intuitive","Requires skin contact"] },
  { id:"pressure",cat:"feedback",name:"Pressure",sub:"Feedback",img:"output_pressure.png",desc:"Mechanical pressure output — inflatable, pneumatic, or squeeze.",pros:["Strong physical sensation","Calming potential"],cons:["Mechanical complexity","Slow"],considerations:["Blood pressure cuff-style actuation","Consider compression garments for wearables"] },
  { id:"texture",cat:"feedback",name:"Texture",sub:"Feedback",img:"output_texture.png",desc:"Surface texture change — shape memory, electroactive polymers.",pros:["Tactile information without looking"],cons:["Exotic materials","Slow actuation","Expensive"],considerations:["Braille-style pin arrays for information","Consider electrotactile as lighter alternative"] },
  { id:"geometrychange",cat:"feedback",name:"Geometry Change",sub:"Feedback",img:"output_geometrychange.png",desc:"Physical shape transformation — morphing surfaces, deployable structures.",pros:["Dramatic, attention-getting","Physical information"],cons:["Mechanically complex","Reliability challenges"],considerations:["Shape memory alloys for small scale","Consider servo-driven mechanisms for larger transformations"] },
  { id:"information",cat:"feedback",name:"Information",sub:"Feedback",img:"output_information.png",desc:"Content display — text, images, video, data visualization.",pros:["Rich semantic content","Flexible"],cons:["Requires display","Visual attention needed"],considerations:["Match information density to glance duration","Consider progressive disclosure"] },
  { id:"electrotactile",cat:"feedback",name:"Electrotactile",sub:"Feedback",img:"feedback_electrotactile.png",desc:"Mild electrical stimulation of skin surface to create precise tactile sensations.",pros:["High spatial resolution — pin-point sensation","Very fast response time","Low power"],cons:["User acceptance and comfort barrier","Electrode-to-skin contact required","Regulatory scrutiny for body-contact devices"],considerations:["Typically <1mA at electrode — below pain threshold","Used in prosthetic hand feedback and VR haptic gloves","Requires conductive fabric, gel electrode, or metal contact"] },
  { id:"midairhaptics",cat:"feedback",name:"Mid-Air Haptics",sub:"Feedback",img:"feedback_midair.png",desc:"Ultrasound phased array focuses pressure waves to create tactile sensations in free air.",pros:["No wearable or contact needed","Spatial — haptic point can move in 3D","Memorable and novel experience"],cons:["Expensive phased-array hardware","Effective range ~30cm","Sensation intensity is subtle — not strong feedback"],considerations:["Ultrahaptics / Ultraleap Stratos for modules","Works best for kiosks and museum installations","Combine with hand tracking for interactive mid-air UI"] },
  { id:"olfactory",cat:"feedback",name:"Olfactory",sub:"Feedback",img:"feedback_olfactory.png",desc:"Scent release as an output channel — smell as notification, atmosphere, or experience layer.",pros:["Highly memorable and emotionally resonant","Bypasses visual and audio overload","Unique modality — stands out"],cons:["Consumable cartridges need replacement","Slow diffusion — hard to start or stop quickly","Strong individual variation in sensitivity and preference"],considerations:["oNotes or Aromajoin for hardware modules","Suitable for gaming, retail experience, and accessibility","Avoid in shared public spaces — always require user opt-in"] },

  // ENABLE / CONNECT (green)
  { id:"bluetooth",cat:"connect",name:"Bluetooth",sub:"Connect",img:"enable_bluetooth.png",desc:"Short-range wireless. BLE for low power, Classic for audio/data.",pros:["Low power (BLE)","Universal phone support","Small chip footprint"],cons:["Short range ~10m","Pairing complexity","Metal housing blocks signal"],considerations:["BLE for sensors, Classic for audio","Cannot be fully encased in metal","User needs pairing interface","If long battery life needed, use BLE not Classic"] },
  { id:"wifi",cat:"connect",name:"WiFi",sub:"Connect",img:"enable_wifi.png",desc:"Standard wireless networking. High bandwidth, internet access.",pros:["High bandwidth","Internet access","Established infrastructure"],cons:["Power hungry","Needs access point","Security configuration"],considerations:["Consider WiFi Direct for peer-to-peer","Power consumption 10-50x of BLE","Needs antenna clearance from metal/body"] },
  { id:"lora",cat:"connect",name:"LoRa",sub:"Connect",img:"enable_lora.png",desc:"Long-range, low-power radio. Ideal for IoT sensor networks.",pros:["Multi-kilometer range","Very low power","No infrastructure needed"],cons:["Very low bandwidth","High latency"],considerations:["Perfect for periodic sensor data","Not for real-time or audio/video","Consider LoRaWAN for managed networks"] },
  { id:"cellular",cat:"connect",name:"Cellular",sub:"Connect",img:"enable_cellular.png",desc:"Mobile network connectivity — 4G/5G/NB-IoT.",pros:["Wide coverage","No local infrastructure","High bandwidth"],cons:["Subscription cost","Power hungry","Antenna size"],considerations:["NB-IoT for low-power IoT","SIM management adds complexity","Consider eSIM for flexibility"] },
  { id:"nfc",cat:"connect",name:"NFC",sub:"Connect",img:"enable_NFC.png",desc:"Near-field communication. Touch-to-pair, touch-to-pay, data exchange.",pros:["Intuitive tap interaction","Passive tags need no power","Secure"],cons:["Very short range ~4cm","Low bandwidth"],considerations:["Great for pairing initiation then handoff to BLE","NFC tags are cheap and disposable","Metal near antenna degrades performance"] },
  { id:"gps",cat:"connect",name:"GPS",sub:"Connect",img:"enable_GPS.png",desc:"Satellite positioning. Outdoor location with meter-level accuracy.",pros:["Global coverage","Absolute positioning"],cons:["No indoor coverage","30-50mA draw","Slow cold start"],considerations:["Combine with accelerometer for dead reckoning between fixes","A-GPS via cellular reduces first-fix time","Needs clear sky view — antenna placement critical"] },
  { id:"wirednetwork",cat:"connect",name:"Wired Network",sub:"Connect",img:"enable_wirednetwork.png",desc:"Ethernet connectivity. Reliable, fast, no wireless interference.",pros:["Reliable","Fast","No RF issues","PoE possible"],cons:["Physical cable required","Not mobile"],considerations:["Consider PoE for combined power + data","Good for stationary installations"] },
  { id:"antenna",cat:"connect",name:"Antenna",sub:"Connect",img:"enable_antenna.png",desc:"RF antenna design. Required for any wireless communication.",pros:["Enables all wireless comms"],cons:["Size vs frequency tradeoff","Affected by nearby materials"],considerations:["PCB antenna cheapest, external best performance","Keep clear of metal, batteries, hands","Match antenna to frequency band"] },
  { id:"cloud",cat:"connect",name:"Cloud",sub:"Connect",img:"enable_cloud.png",desc:"Cloud services — storage, processing, ML inference, dashboards.",pros:["Unlimited processing","Data persistence","Remote access"],cons:["Requires internet","Latency","Privacy concerns","Ongoing cost"],considerations:["Edge computing reduces cloud dependency","Consider offline-first with cloud sync","GDPR/data residency for health data"] },
  { id:"zigbee",cat:"connect",name:"Zigbee",sub:"Connect",img:"enable_zigbee.png",desc:"IEEE 802.15.4 mesh networking protocol — low-power IoT for smart home and building automation.",pros:["Mesh topology — self-healing network","Very low power — coin cells last years","Mature ecosystem, Matter-compatible via bridge"],cons:["Requires coordinator/hub device","2.4GHz band — congestion with WiFi","Lower data rate than WiFi"],considerations:["Now part of Matter standard via Thread/Zigbee bridging","Silicon Labs EFR32MG series widely used","Good for sensor networks across large buildings"] },
  { id:"thread",cat:"connect",name:"Thread",sub:"Connect",img:"enable_thread.png",desc:"IP-based (IPv6) mesh protocol — the core networking layer of the Matter smart home standard.",pros:["IP-native — direct IPv6 addressing","Mesh with automatic self-healing","Foundation of Matter standard"],cons:["Requires a Thread Border Router","2.4GHz band only","Ecosystem still maturing beyond smart home"],considerations:["Nordic nRF52840 has native Thread + BLE support","Border router built into Apple HomePod, Google Nest Hub, Amazon Echo","Best choice for new smart home products targeting Matter certification"] },
  { id:"uwb",cat:"connect",name:"Ultra-Wideband",sub:"Connect",img:"enable_uwb.png",desc:"Centimeter-accurate spatial ranging and location between devices using wide-band radio pulses.",pros:["~10cm ranging accuracy","Immune to multipath interference","Directional finding — knows angle to device"],cons:["Short effective range ~10-50m","Higher cost than BLE","Limited ecosystem vs BLE/WiFi"],considerations:["Apple U1 chip and Qorvo DW3000 are key chips","Used in AirTags, iPhone spatial awareness, and secure car keys","Excellent for indoor positioning and proximity-based secure access"] },

  // ENABLE / PORT (green)
  { id:"usb",cat:"port",name:"USB",sub:"Port",img:"enableusb.png",desc:"Universal Serial Bus. Data transfer, power delivery, debugging.",pros:["Universal","Power + data","Debugging access"],cons:["Port adds vulnerability","Waterproofing challenge"],considerations:["USB-C for modern products","Consider magnetic connectors for wearables","Port cover for IP rating"] },
  { id:"hdmi",cat:"port",name:"HDMI",sub:"Port",img:"enablehdmi.png",desc:"High-definition video/audio output. External display connection.",pros:["Standard AV output","High quality"],cons:["Large connector","Power draw"],considerations:["Mini/Micro HDMI for compact devices","Consider wireless display alternatives"] },
  { id:"lan",cat:"port",name:"LAN",sub:"Port",img:"enablelan.png",desc:"RJ45 Ethernet port. Wired network connection.",pros:["Reliable","Fast","PoE capable"],cons:["Large connector","Stationary only"],considerations:["Consider PoE for single-cable installation","Magnetic jack for isolation"] },

  // ENABLE / CHARGING (green)
  { id:"battery",cat:"charging",name:"Battery",sub:"Charging",img:"enable_battery.png",desc:"Rechargeable cell — LiPo, Li-ion, or alternatives.",pros:["Portable operation","Various form factors"],cons:["Limited life","Safety concerns","Weight"],considerations:["LiPo for flat/custom shapes","Include charge management IC","Consider user-replaceable vs sealed"] },
  { id:"wiredcharge",cat:"charging",name:"Wired Charge",sub:"Charging",img:"enable_wiredcharge.png",desc:"Cable-based charging — USB, barrel jack, or custom connector.",pros:["Fast charging","Simple","Reliable"],cons:["Port wear","Cable management"],considerations:["USB-C PD for universal charging","Magnetic connectors reduce port wear"] },
  { id:"wireless",cat:"charging",name:"Wireless Charge",sub:"Charging",img:"enable_wireless.png",desc:"Qi or custom inductive charging. No exposed contacts.",pros:["No port needed","Waterproof-friendly","Convenient"],cons:["Slower","Heat generation","Alignment sensitive"],considerations:["Qi standard for phone charger compatibility","Alignment magnets improve UX","Coil size affects charging area"] },
  { id:"solar",cat:"charging",name:"Solar Power",sub:"Charging",img:"enable_solarpower.png",desc:"Photovoltaic cells for energy harvesting.",pros:["Renewable","No cables","Low maintenance"],cons:["Weather dependent","Requires surface area","Low power output"],considerations:["Supplement, rarely sole power source","Consider indoor light harvesting panels","Pairs well with low-power design (BLE + e-ink)"] },

  // ENABLE / COOLING (green)
  { id:"activecooling",cat:"cooling",name:"Active Cooling",sub:"Cooling",img:"enable_activecolling.png",desc:"Fan, Peltier, or liquid cooling. For high-performance processors.",pros:["Effective heat removal","Enables high performance"],cons:["Noise","Power draw","Moving parts"],considerations:["Fan noise is a UX issue","Consider heat pipe + small fan combo","Dust ingress with fan openings"] },
  { id:"passivecooling",cat:"cooling",name:"Passive Cooling",sub:"Cooling",img:"enable_passivecooling.png",desc:"Heatsinks, thermal pads, heat-spreading materials. Silent cooling.",pros:["Silent","No power","Reliable"],cons:["Limited thermal capacity","Needs airflow/surface area"],considerations:["Aluminum heatsinks for cost, copper for performance","Consider enclosure as heatsink","Thermal interface material selection matters"] },

  // ENABLE / PLATFORM (green)
  { id:"mcu",cat:"platform",name:"MCU",sub:"Platform",img:"enable_mcu.png",desc:"Microcontroller unit. The brain — Arduino, ESP32, STM32, Nordic nRF.",pros:["Low power","Real-time control","Small footprint"],cons:["Limited processing","Programming required"],considerations:["ESP32 for WiFi+BLE combo","Nordic nRF for BLE focus","Arduino for prototyping, production MCU for deployment"] },
  { id:"android",cat:"platform",name:"Android",sub:"Platform",img:"enable_android.png",desc:"Android OS — for rich UI, app ecosystem, complex processing.",pros:["Rich UI framework","App ecosystem","Camera/ML support"],cons:["Power hungry","Boot time","Complexity"],considerations:["Android Things discontinued — use standard Android","Consider Linux for headless applications","SBC like RPi for prototyping"] },
  { id:"windows",cat:"platform",name:"Windows",sub:"Platform",img:"enable_windows.png",desc:"Windows OS — for desktop/kiosk applications with full computing.",pros:["Full software ecosystem","Peripheral support","Development tools"],cons:["Heavy resources","Boot time","Licensing"],considerations:["Good for kiosks and installations","Consider Windows IoT for embedded","Overkill for simple embedded tasks"] },
  { id:"linux",cat:"platform",name:"Linux",sub:"Platform",img:"enable_linux.png",desc:"Linux OS — flexible open-source platform for SBCs and embedded computers.",pros:["Open source and free","Huge driver ecosystem","Highly configurable for production"],cons:["Boot time (seconds not ms)","No hard real-time guarantees without patching","Setup complexity vs RTOS"],considerations:["Raspberry Pi / NVIDIA Jetson for prototyping","Yocto or Buildroot for lean production images","PREEMPT_RT patch provides near-real-time for most use cases"] },
  { id:"rtos",cat:"platform",name:"RTOS",sub:"Platform",img:"enable_rtos.png",desc:"Real-Time Operating System — FreeRTOS, Zephyr, or ThreadX. Deterministic task scheduling.",pros:["Hard real-time guarantees — microsecond timing","Tiny footprint — runs on bare MCU","Deterministic and auditable for safety-critical use"],cons:["No rich display UI framework","Steeper learning curve than Arduino","Smaller ecosystem than Linux"],considerations:["FreeRTOS has widest MCU support (ESP32, STM32, etc.)","Zephyr OS has strong BLE, Thread, Zigbee stacks","Use when timing precision < 1ms is required"] },

  // PATTERN / PHYSICAL AFFORDANCE
  { id:"pressafford",cat:"physaffordance",name:"Press",sub:"Affordance",img:"afford_press.png",desc:"A surface or element that invites downward force — button, key, or membrane pad.",pros:["Universally understood action","Clear tactile confirmation possible","Discrete and intentional"],cons:["Requires surface contact","Can fatigue with heavy use"],considerations:["Travel distance and actuation force define the feel","Click or snap feedback makes action feel complete","Raised edges help locate button eyes-free"] },
  { id:"squeezeafford",cat:"physaffordance",name:"Squeeze",sub:"Affordance",img:"afford_squeeze.png",desc:"Two opposing surfaces that compress when gripped — handles, bulbs, grips.",pros:["Natural bimanual or unimanual grip action","High force input available","Tactile and proprioceptive clarity"],cons:["Limited to objects that can be held","Not accessible for weak grip"],considerations:["Force-sensitive resistor or strain gauge detects squeeze intensity","Used in stress-relief devices, medical grips, and trigger inputs","Map squeeze force to analog value for expressive control"] },
  { id:"twistafford",cat:"physaffordance",name:"Twist",sub:"Affordance",img:"afford_twist.png",desc:"Rotational motion of a handle, cap, or knob — like opening a jar.",pros:["Natural for setting values","Provides continuous range","Eyes-free operation possible"],cons:["Requires secure grip","Two-hand twist needs symmetric grip points"],considerations:["Rotary encoder or potentiometer captures twist angle","Soft stops or detents prevent over-rotation","Good for volume, intensity, and selection on physical products"] },
  { id:"slideafford",cat:"physaffordance",name:"Slide",sub:"Affordance",img:"afford_slide.png",desc:"Linear movement along a track — sliders, drawers, locking mechanisms.",pros:["Position maps directly to value — intuitive","Visible state even without power","Satisfying smooth motion"],cons:["Track accumulates dust and debris","Linear space requirement"],considerations:["Conductive plastic or optical encoder for smooth reading","Motorised slider can provide haptic feedback and auto-position","Wide slider caps are more ergonomic than narrow ones"] },
  { id:"tiltafford",cat:"physaffordance",name:"Tilt",sub:"Affordance",img:"afford_tilt.png",desc:"Leaning or angling an object to indicate direction or preference.",pros:["Natural spatial metaphor","No surface contact needed","Works as passive always-on affordance"],cons:["Sensitive to accidental tilts","Requires accelerometer or gyroscope"],considerations:["Dead-zone calibration prevents false positives from natural hand sway","Tilt direction → navigation direction is intuitive","Consider paired with visual indicator showing tilt axis"] },
  { id:"shakeafford",cat:"physaffordance",name:"Shake",sub:"Affordance",img:"afford_shake.png",desc:"Rapid back-and-forth physical agitation — used for undo, shuffle, or reset.",pros:["Dramatic and memorable","No screen or button needed","Attention-grabbing as an output trigger"],cons:["High accidental trigger risk","Requires high-g threshold to differentiate from walking"],considerations:["Threshold typically >2g peak to avoid false positives","Provide clear undo-the-undo option","Avoid in devices worn on the body — steps and movement cause constant triggers"] },
  { id:"tapafford",cat:"physaffordance",name:"Tap",sub:"Affordance",img:"afford_tap.png",desc:"Brief contact with a surface — finger, knuckle, or stylus touch.",pros:["Low cognitive load — simplest possible action","Fast and precise","Works on any hard surface with accelerometer"],cons:["Easy to mis-trigger on sensitive surfaces","Limited expressiveness alone"],considerations:["Double-tap and long-press extend vocabulary from single surface","Accelerometer in object detects tap on enclosure surface","Force threshold distinguishes accidental graze from intentional tap"] },
  { id:"strokeafford",cat:"physaffordance",name:"Stroke",sub:"Affordance",img:"afford_stroke.png",desc:"Slow, deliberate linear touch movement — caress or wipe gesture.",pros:["Calming, intimate interaction quality","Continuous and directional","Well-suited to emotional or ambient devices"],cons:["Slow — not for time-sensitive input","Requires sensitive capacitive strip or surface"],considerations:["Resistive or capacitive strip detects stroke direction and speed","Used in pet robots, wellness devices, ambient interfaces","Speed of stroke can carry meaning — gentle vs urgent"] },
  { id:"pullaff",cat:"physaffordance",name:"Pull",sub:"Affordance",img:"afford_pull.png",desc:"Drawing an object, surface, or cord toward the body — ergonomic retrieval action.",pros:["Natural for retrieval, activation, or unlatching","High-force capable","Intuitive — pulling a cord to activate is cross-cultural"],cons:["Mechanical complexity for cord management","Return mechanism required"],considerations:["Spring return vs ratchet latch are very different experiences","Cord pull activation has long history in emergency and accessibility devices","Map pull distance to output intensity for expressive control"] },
  { id:"foldafford",cat:"physaffordance",name:"Fold",sub:"Affordance",img:"afford_fold.png",desc:"Bending or folding a flexible surface — origami-inspired physical interaction.",pros:["Novel and memorable","Large surface area can reduce to small form","Can encode state in physical form"],cons:["Flexible materials have limited sensing options","Durability concerns at fold creases","Manufacturing complexity"],considerations:["Conductive fabric or bend sensor in fold crease detects angle","Shape memory polymer returns to original form","Foldable phones and e-paper are pushing this space forward"] },
  { id:"coverafford",cat:"physaffordance",name:"Cover",sub:"Affordance",img:"afford_cover.png",desc:"Placing a hand, object, or lid over a sensor or screen to trigger or mask.",pros:["Intuitive privacy gesture","Cheap to implement — proximity or light sensor","Natural sleep or mute interaction"],cons:["Hard to communicate without onboarding","Accidental triggers from pockets/bags"],considerations:["Proximity or LDR sensor detects cover easily","Phone face-down = mute calls is well-established pattern","Cover + timer = snooze pattern for notifications"] },
  { id:"hoverafford",cat:"physaffordance",name:"Hover",sub:"Affordance",img:"afford_hover.png",desc:"Approaching a surface without touching — preview and anticipation interaction layer.",pros:["Contactless — hygienic","Provides preview before commitment","Works in PPE or gloved contexts"],cons:["Hard to communicate without cues","Needs proximity or capacitive sensor","Less precise than contact"],considerations:["Capacitive proximity detects hand 2–5cm above surface","Useful for menus that reveal on approach","Define transition from hover-preview to touch-confirm clearly"] },
  { id:"blowafford",cat:"physaffordance",name:"Blow",sub:"Affordance",img:"afford_blow.png",desc:"Directing breath at a sensor or opening — extinguish, dismiss, or activate.",pros:["Hands-free","Memorable and playful","Accessible for limited mobility"],cons:["Hygienic concerns in shared devices","Inconsistent detection across users","Only works at close range"],considerations:["Directional mic or barometric pressure sensor detects breath","Used in candle-simulation interfaces and accessibility tools","Pair with visual feedback showing breath detection threshold"] },
  { id:"traceafford",cat:"physaffordance",name:"Trace",sub:"Affordance",img:"afford_trace.png",desc:"Drawing a path or shape on a surface — signature, pattern unlock, or drawing.",pros:["High information density in single gesture","Can encode complex patterns for authentication","Natural and expressive"],cons:["Requires precision surface","Slow compared to button"],considerations:["Capacitive touch surface needed for continuous path tracking","Pattern recognition can enable unlock codes","Trace + shape recognition for symbol-based input systems"] },
  { id:"pinchafford",cat:"physaffordance",name:"Pinch",sub:"Affordance",img:"afford_pinch.png",desc:"Two fingers closing on a surface or object — grip, zoom-out, close.",pros:["Natural for scaling and size reduction","Well-established on touchscreens","Can work on physical objects with FSR"],cons:["Requires multitouch or force sensing","Not accessible for arthritis or weak grip"],considerations:["Force sensing resistors under grip points detect pinch intensity","Pinch-to-zoom is expected behaviour on any touch display","Physical pinch on objects can trigger release or deactivation"] },

  // PATTERN / TEMPORAL PATTERN
  { id:"tempinstant",cat:"temporal",name:"Instant",sub:"Temporal",img:"temporal_instant.png",desc:"Response occurs in <100ms — feels simultaneous with input. No perceivable delay.",pros:["Feels alive and direct","Maximum sense of control","Reduces errors from premature second actions"],cons:["Requires fast hardware and tight code","Harder to achieve over wireless","No opportunity for confirmation"],considerations:["Human perception threshold for 'instant' is ~100ms","Critical for audio, gaming, and physical controls","Measure end-to-end latency from input to output — not just processing time"] },
  { id:"tempdelayed",cat:"temporal",name:"Delayed",sub:"Temporal",img:"temporal_delayed.png",desc:"A deliberate pause between input and response — 500ms to a few seconds.",pros:["Enables undo before commit","Reduces accidental trigger consequences","Can build anticipation"],cons:["Feels sluggish if not communicated","User may repeat input thinking it failed"],considerations:["Always show a progress indicator or countdown","Used in toaster-style undo notifications","Critical: distinguish delayed-by-design from delayed-by-lag visually"] },
  { id:"tempgradual",cat:"temporal",name:"Gradual",sub:"Temporal",img:"temporal_gradual.png",desc:"Response eases in or out over time — fades, grows, dissolves.",pros:["Softer, less alarming","Guides attention gently","Reduces jarring mode changes"],cons:["Slower to communicate urgent information","Can feel vague for status changes"],considerations:["Ease-in-out curves feel natural","Use 200–500ms for UI transitions","Gradual onset important for haptic and thermal feedback to avoid startle"] },
  { id:"temprhythmic",cat:"temporal",name:"Rhythmic",sub:"Temporal",img:"temporal_rhythmic.png",desc:"Regular repeating pattern — heartbeat, metronome, breathing pulse.",pros:["Communicates state without attention","Calming or alerting depending on frequency","Distinguishable at a glance"],cons:["Becomes irritating if not dismissible","Different rhythms need to stay distinct"],considerations:["Slow pulse (1Hz) = standby/breathing, fast (4Hz) = alert","Rhythm can encode urgency levels","Critical for notification design — avoid notification fatigue"] },
  { id:"temppulsing",cat:"temporal",name:"Pulsing",sub:"Temporal",img:"temporal_pulsing.png",desc:"Brief bursts that repeat with gaps — attention-grabbing notification pattern.",pros:["Catches peripheral attention","Can vary burst count to encode meaning","Low duty cycle = power efficient"],cons:["Aggressive if overused","Similar to rhythmic — needs clear differentiation"],considerations:["3 short pulses = standard notification in many systems","Pulse count can encode urgency level (1=info, 3=warning, 5=critical)","Use haptic pulses for private notification in public spaces"] },
  { id:"tempescalating",cat:"temporal",name:"Escalating",sub:"Temporal",img:"temporal_escalating.png",desc:"Intensity or frequency increases over time — alarm that grows if not acknowledged.",pros:["Self-prioritising — demands attention proportionally","Reduces missed alerts","Natural urgency signal"],cons:["Stressful if escalation is too fast","Requires state management and timer logic"],considerations:["Start subtle (low brightness/volume/haptic), escalate every 30s","Alarm clock snooze is classic escalating pattern","Always provide a clear dismiss action at every escalation level"] },
  { id:"tempdecaying",cat:"temporal",name:"Decaying",sub:"Temporal",img:"temporal_decaying.png",desc:"Signal or feedback fades out after a trigger — echo, afterglow, diminishing vibration.",pros:["Natural and organic feel","Communicates recency — stronger = more recent","Doesn't demand attention to dismiss"],cons:["Can be missed if decay is too fast","State unclear at mid-decay"],considerations:["Decay envelope shape (linear vs exponential) changes feel significantly","Good for ambient displays showing 'last activity'","Rumble motors naturally decay — use this rather than fighting it"] },
  { id:"temppersistent",cat:"temporal",name:"Persistent",sub:"Temporal",img:"temporal_persistent.png",desc:"Signal or state stays active until explicitly cleared — sticky notification or indicator.",pros:["Ensures important state is not missed","Visible without active attention","Simple state machine — on or off"],cons:["Can accumulate and overwhelm","Requires deliberate user action to clear"],considerations:["Badge counts on icons are persistent indicators","Always provide easy one-tap clear or dismiss","Persistent red LED = system fault is a well-understood pattern"] },
  { id:"temptriggered",cat:"temporal",name:"Triggered",sub:"Temporal",img:"temporal_triggered.png",desc:"Response fires once on a specific event — edge-triggered, not state-based.",pros:["Precise and predictable","Low overhead — fires once and stops","Clear causation between action and response"],cons:["Missed triggers are invisible — no second chance","Edge vs level trigger confusion is a common bug"],considerations:["Software debounce essential for physical button triggers","Consider queuing triggers that arrive while system is busy","Log triggers for debugging — they are transient and hard to catch"] },
  { id:"tempcontinuous",cat:"temporal",name:"Continuous",sub:"Temporal",img:"temporal_continuous.png",desc:"Ongoing output that runs as long as a condition is true — streaming, always-on.",pros:["Real-time representation of live state","No latency between state and display","Natural for sensor streams"],cons:["High power consumption","Generates large data volumes","Can overwhelm user with constant change"],considerations:["Consider decimation or smoothing to reduce update rate","Rolling average prevents jitter in displayed value","Audio and haptic continuous output needs volume/intensity control"] },
  { id:"tempscheduled",cat:"temporal",name:"Scheduled",sub:"Temporal",img:"temporal_scheduled.png",desc:"Action or output fires at a predetermined time or interval — alarm, reminder, report.",pros:["Predictable and plannable by user","Can be set and forgotten","Enables duty cycling for power saving"],cons:["Requires accurate real-time clock","Timezone and DST handling is error-prone","User must set it up"],considerations:["RTC module (DS3231) for accurate timekeeping off main MCU","Store schedule in non-volatile memory to survive power loss","Always show next scheduled time to user for confirmation"] },
  { id:"tempcontextual",cat:"temporal",name:"Contextual",sub:"Temporal",img:"temporal_contextual.png",desc:"Timing adapts to user context — slows at night, speeds up under urgency, pauses when asleep.",pros:["Feels intelligent and considerate","Reduces disturbance in wrong contexts","Can significantly reduce notification fatigue"],cons:["Context sensing adds complexity and sensors","Wrong context inference is frustrating","Privacy implications of context sensing"],considerations:["Simple heuristics: 11pm–7am = silent mode, no motion = sleeping","Phone accelerometer or light sensor can infer context cheaply","Always allow override — context inference is imperfect"] },

  // PATTERN / FEEDBACK MODALITY
  { id:"modalvisual",cat:"modality",name:"Visual Only",sub:"Modality",img:"modal_visual.png",desc:"All feedback delivered through the eyes alone — screens, lights, indicators.",pros:["High information density","Precise and spatial","Silent — no audio disturbance"],cons:["Requires eyes on device","Fails in dark or bright glare","Inaccessible for visually impaired"],considerations:["Use for secondary/ambient info where audio would be disruptive","High-contrast design for glare environments","Always pair with at least one non-visual channel for critical alerts"] },
  { id:"modalaudio",cat:"modality",name:"Audio Only",sub:"Modality",img:"modal_audio.png",desc:"All feedback delivered through sound alone — tones, speech, earcons.",pros:["Works eyes-free","Reaches user at distance","Rich information via speech"],cons:["Disturbs others in shared spaces","Ambient noise can mask it","Hearing impairment blocks it"],considerations:["Earcon design: short, distinct, and learnable","Bone conduction for private audio without earphones","Speech synthesis for screen-reader compatible devices"] },
  { id:"modalhaptic",cat:"modality",name:"Haptic Only",sub:"Modality",img:"modal_haptic.png",desc:"All feedback delivered through touch and vibration alone — private and silent.",pros:["Private — only felt by wearer","Silent in shared spaces","Works eyes and ears busy"],cons:["Limited vocabulary without learning","Intensity varies by skin location","Weak for distance notification"],considerations:["LRA motors for precise pattern playback","Body location significantly affects perception: wrist vs chest vs thigh","3 short pulses is near-universal notification pattern"] },
  { id:"modalredundant",cat:"modality",name:"Multimodal Redundant",sub:"Modality",img:"modal_redundant.png",desc:"Same message delivered simultaneously through multiple channels — see it, hear it, feel it.",pros:["Maximum reliability — redundancy covers sensory failures","Accessible to diverse users","Highly noticeable for critical alerts"],cons:["Potentially overwhelming","All channels must be dismissible","Can feel disproportionate for low-priority info"],considerations:["Standard for safety-critical systems (emergency alarms)","Give user control over which channels are active","Test that each channel alone is still intelligible"] },
  { id:"modalcomplementary",cat:"modality",name:"Multimodal Complementary",sub:"Modality",img:"modal_complementary.png",desc:"Different channels carry different parts of the message — visual shows what, haptic shows when.",pros:["Efficient — each channel does what it does best","Richer total communication than single channel","Feels natural — mirrors real world"],cons:["More design complexity","Channels must be synchronised","Users must learn the mapping"],considerations:["Classic: visual indicator + haptic pulse on state change","Audio carries urgency, visual carries content","Asynchrony between channels destroys the effect — sync carefully"] },
  { id:"modalperipheral",cat:"modality",name:"Peripheral",sub:"Modality",img:"modal_peripheral.png",desc:"Feedback designed to be noticed in the edge of attention — ambient, not demanding.",pros:["Doesn't interrupt primary task","Provides awareness without demanding focus","Lower cognitive load"],cons:["Easy to miss completely","Not suitable for urgent alerts","Requires ambient display or always-on indicator"],considerations:["Slow colour change, ambient light, or background audio cue","Used in notification lights, activity rings, ambient orbs","Design for glanceability — meaningful in <200ms of attention"] },
  { id:"modalfocal",cat:"modality",name:"Focal",sub:"Modality",img:"modal_focal.png",desc:"Feedback designed to capture full attention and demand acknowledgement.",pros:["Cannot be missed","Appropriate for critical or time-sensitive information","Forces user to engage"],cons:["Interrupts current task","Frustrating if overused for low-priority events","Needs clear dismiss mechanism"],considerations:["Modal dialogs, full-screen alerts, strong haptic + audio + visual together","Reserve focal feedback for truly important events only","Always include a dismiss or snooze option — no inescapable alerts"] },

  // FORM / MATERIAL QUALITY
  { id:"matsoft",cat:"material",name:"Soft",sub:"Material",img:"mat_soft.png",desc:"Compliant, deformable material — rubber, silicone, foam, soft-touch coating.",pros:["Comfortable for prolonged contact","Absorbs shock and vibration","Feels approachable and safe"],cons:["Collects dust and oils","Degrades faster than hard materials","Less precise for controls"],considerations:["Silicone overmoulding is standard for grip zones and wearables","Shore A 40-60 for comfortable grip","Antimicrobial additives available for healthcare products"] },
  { id:"mathard",cat:"material",name:"Hard",sub:"Material",img:"mat_hard.png",desc:"Rigid, non-deformable material — polycarbonate, ABS, aluminium, steel.",pros:["Precise dimensions","Durable and scratch-resistant","Premium feel"],cons:["Unforgiving on impact","Cold feel in low temperatures","Transmits vibration without damping"],considerations:["PC/ABS blend balances strength with processability","Texture via moulded grain or sandblasting changes perceived quality","Hard materials need chamfered edges for comfort in handheld devices"] },
  { id:"matwarm",cat:"material",name:"Warm",sub:"Material",img:"mat_warm.png",desc:"Materials with low thermal conductivity that feel warm to the touch — wood, plastic, fabric.",pros:["Psychologically reassuring","Comfortable for extended skin contact","Natural, organic associations"],cons:["Harder to sterilise than smooth surfaces","Wood requires sealing","Lower precision than metal"],considerations:["Thermal conductivity: wood ~0.1, plastic ~0.2, aluminium ~200 W/mK","Warm feel important for medical devices, children's products, wellness tech","Powder coating on metal adds warm perceived temperature"] },
  { id:"matcool",cat:"material",name:"Cool / Metal",sub:"Material",img:"mat_cool.png",desc:"High thermal conductivity materials that feel cool and weighty — aluminium, stainless steel, brass.",pros:["Premium, precise feel","Excellent heat dissipation","Durable and scratch-resistant"],cons:["Cold to touch in winter","Heavy","Higher cost and manufacturing complexity"],considerations:["Aluminium 6061 most common for CNC machined enclosures","Anodising adds colour and hardness without adding thickness","Mass of metal creates reassuring weight — can be a deliberate design choice"] },
  { id:"mattextured",cat:"material",name:"Textured",sub:"Material",img:"mat_textured.png",desc:"Surface with deliberate micro or macro texture — knurling, grain, ribs, dimples.",pros:["Improves grip","Communicates affordance — rough = grip here","Distinguishable by touch alone"],cons:["Texture traps dirt and oils","Complex tooling for moulded texture","UV printing texture has limited durability"],considerations:["Knurling pitch of 0.5–1mm works well for finger grip","Different textures on controls helps blind navigation","Laser etching enables fine custom textures on finished parts"] },
  { id:"matsmooth",cat:"material",name:"Smooth",sub:"Material",img:"mat_smooth.png",desc:"Polished or gloss-coated surface with minimal friction — glass, chrome, gloss lacquer.",pros:["Easy to clean","Premium, contemporary aesthetic","Low friction enables sliding interactions"],cons:["Fingerprint magnet","Slippery — reduces grip","Scratches show prominently"],considerations:["AG (anti-glare) coating on glass reduces fingerprints and glare","Smooth surfaces communicate 'don't touch here'","Pair smooth passive surfaces with textured interactive zones for clear affordance"] },
  { id:"matflexible",cat:"material",name:"Flexible",sub:"Material",img:"mat_flexible.png",desc:"Material that bends without breaking — TPU, flexible PCB, textile, silicone film.",pros:["Conforms to body curves","Survives drops via flex","Enables novel folding and wrapping form factors"],cons:["Electronics inside flex zones is challenging","Connector fatigue at flex-rigid transitions","Lower precision than rigid"],considerations:["Flex PCBs rated for 10,000–100,000 flex cycles depending on construction","Strain relief at flex-rigid junction is critical for longevity","TPU overmoulding on rigid chassis gives best of both worlds"] },
  { id:"mattransparent",cat:"material",name:"Transparent",sub:"Material",img:"mat_transparent.png",desc:"See-through material revealing internal workings or layering depth — glass, clear polycarbonate, acrylic.",pros:["Reveals internals — educational and trust-building","Enables illumination from within","Depth and layering visual effect"],cons:["Shows fingerprints and dust","Structural strength lower than opaque equivalents","Manufacturing requires scratch-free handling"],considerations:["Polycarbonate for impact resistance, acrylic for clarity","Tinted translucent adds character while hiding internal complexity","Light guide design allows controlled internal illumination through transparent walls"] },
  { id:"matweighted",cat:"material",name:"Weighted",sub:"Material",img:"mat_weighted.png",desc:"Deliberately heavy product — added mass creates premium feel and stability.",pros:["Communicates quality and value","Stays put on surfaces — doesn't slide","Satisfying to handle"],cons:["Heavier for portable use","Higher shipping cost","Material or added ballast cost"],considerations:["Target weight varies by product type: TV remote 130g, pen 15g, headphones 250g","Steel inserts or tungsten ballast in handles for precise weight tuning","Weight distribution matters — top-heavy feels precarious"] },
  { id:"matlightweight",cat:"material",name:"Lightweight",sub:"Material",img:"mat_lightweight.png",desc:"Minimally massed product — foam fills, magnesium alloy, carbon fibre — for wearables and portables.",pros:["Reduces fatigue in worn or held devices","Better portable user experience","Can enable larger form factors without weight penalty"],cons:["Often more expensive materials","Hollow or thin-wall structures need careful structural design","Can feel cheap if too light"],considerations:["Magnesium alloy is 33% lighter than aluminium with similar strength","Carbon fibre for premium lightweight — cost is significant","Internal ribbing in plastic gives strength without mass"] },

  // FORM / SPATIAL RELATIONSHIP
  { id:"spatintimate",cat:"spatial",name:"Intimate Zone",sub:"Spatial",img:"spat_intimate.png",desc:"0–45cm from body — skin contact, personal devices, worn objects. Edward Hall's intimate proxemic zone.",pros:["Maximum user attention and engagement","Enables biometric and body-heat sensing","Always with user"],cons:["Comfort and hygiene critical","Size and weight tightly constrained","Social norms constrain use in public"],considerations:["Wearables live in this zone — comfort over everything","Skin-safe materials (biocompatibility) required for prolonged contact","Privacy expectations are highest here — handle data with extreme care"] },
  { id:"spatpersonal",cat:"spatial",name:"Personal Zone",sub:"Spatial",img:"spat_personal.png",desc:"45cm–1.2m — arm's reach, handheld and tabletop interactions. Personal proxemic zone.",pros:["Direct manipulation possible","High-resolution interaction (touch, precise gesture)","Natural for handheld and tabletop products"],cons:["User must actively reach for device","Limited ambient awareness value at this range","Loses effectiveness if user moves away"],considerations:["Touchscreen, physical controls, and close-range gesture all work here","Standard for consumer electronics and personal productivity tools","Consider user's dominant hand and natural reach arc for control placement"] },
  { id:"spatsocial",cat:"spatial",name:"Social Zone",sub:"Spatial",img:"spat_social.png",desc:"1.2–3.6m — across a table or room, shared screens and social tech. Social proxemic zone.",pros:["Shared viewing and interaction possible","Larger displays appropriate","Voice becomes viable input"],cons:["Touch not possible — remote or voice only","Multiple users may interact simultaneously","Individual attention tracking harder"],considerations:["TV, meeting room display, interactive kiosk sit here","Voice and gesture become primary inputs","Design for shared-view legibility — minimum 24pt text at 2m"] },
  { id:"spatpublic",cat:"spatial",name:"Public Zone",sub:"Spatial",img:"spat_public.png",desc:"3.6m+ — large public display, ambient signage, building-scale interaction. Public proxemic zone.",pros:["Reaches many people simultaneously","High impact at scale","Ambient awareness — no user action needed"],cons:["Very low interaction fidelity at distance","Text must be large — 72pt+ for 10m","Individual engagement is passive only"],considerations:["Minimum 400px per cm at installation distance for legibility","Sound carries well in this zone but is shared — use carefully","Proximity-triggered content as people approach bridges public to social zone"] },
  { id:"spatrelpos",cat:"spatial",name:"Relative Position",sub:"Spatial",img:"spat_relpos.png",desc:"Interaction depends on position relative to another object, person, or reference point.",pros:["Enables context-aware interaction","Natural spatial metaphor","Passive — no button press needed"],cons:["Requires positioning technology (UWB, BLE, camera)","Accuracy varies widely by technology","User must understand the spatial model"],considerations:["UWB for centimetre accuracy, BLE RSSI for metre-level","Relative position of phone to TV enables spatial UI","Dead-reckoning with IMU fills gaps between fixes"] },
  { id:"spatorient",cat:"spatial",name:"Orientation",sub:"Spatial",img:"spat_orient.png",desc:"Device or body facing direction used as meaningful context — which way is the user facing?",pros:["Natural wayfinding metaphor","Compass + accelerometer gives 6-DoF orientation","No user action required"],cons:["Magnetic interference affects compass","Orientation relative to world vs relative to user are different","Complex to communicate orientation state to user"],considerations:["Tilt-compensated compass uses accelerometer to correct for device angle","Orientation used in AR, navigation, and context-aware displays","Show orientation visually on-screen so user can understand device's 'world model'"] },
  { id:"spatheight",cat:"spatial",name:"Height",sub:"Spatial",img:"spat_height.png",desc:"Vertical position used as context — floor, desk, shelf, ceiling level interactions.",pros:["Barometric pressure gives floor-level altitude","Height context changes appropriate interaction type","Natural layer metaphor (ground floor, mezzanine, roof)"],cons:["Barometric altitude drifts — needs recalibration","Indoor GPS doesn't resolve height","Multi-storey buildings need floor mapping"],considerations:["BMP390 barometer accurate to ~10cm vertically","Floor-level detection for in-building navigation","Shelf-level or ceiling-mounted sensors interact very differently from hand-level"] },
  { id:"spatdirection",cat:"spatial",name:"Direction",sub:"Spatial",img:"spat_direction.png",desc:"Which way an action or signal is going — directional audio, directed haptic, aimed light.",pros:["Spatial information without a screen","Audio or haptic can guide navigation","Intuitive — points toward something"],cons:["Direction rendering requires multiple actuators or beamforming","Hard to communicate direction via single speaker or motor","User must learn spatial audio mapping"],considerations:["Binaural audio (headphones) for directional audio cues","Phased microphone array for directional sound capture","Haptic direction: tapping on left wrist = go left is learnable in minutes"] },
  { id:"spatroomscale",cat:"spatial",name:"Room Scale",sub:"Spatial",img:"spat_roomscale.png",desc:"Interaction designed for the full volume of a room — movement, position, and room acoustics matter.",pros:["Full body interaction possible","Room acoustics carry sound naturally","Large interaction canvas"],cons:["Requires tracking technology across full volume","Wiring and power at room scale is a constraint","Multiple simultaneous users create complexity"],considerations:["UWB anchors or camera arrays for room-scale tracking","WiFi RTT (802.11mc) gives room-scale positioning without extra hardware","Design for both centre-of-room and edge-of-room use cases"] },
  { id:"spatboundary",cat:"spatial",name:"Boundary",sub:"Spatial",img:"spat_boundary.png",desc:"A virtual or physical perimeter that triggers interaction when crossed — geofence, proximity fence.",pros:["Automatic context change without user action","Simple yes/no logic — inside or outside","Scales from centimetres to kilometres"],cons:["Boundary crossing detection latency","False triggers near boundary edge","Multiple overlapping boundaries create logic complexity"],considerations:["BLE beacon ring for indoor room boundary","GPS geofence for outdoor — 5m minimum reliable radius","Hysteresis (enter at 2m, exit at 3m) prevents rapid in/out flickering"] },

  // DESIGN / INTERACTION SCALE
  { id:"scalemicro",cat:"scale",name:"Micro",sub:"Scale",img:"scale_micro.png",desc:"A single small action completed in under a second — tap, glance, quick confirm.",pros:["Fast, frictionless","High frequency — usable hundreds of times per day","Low cognitive load"],cons:["Limited information transfer per interaction","Easy to trigger accidentally","Must be easily repeatable if mis-triggered"],considerations:["Micro interactions dominate wearable and notification UX","Feedback must be instant (<100ms) or action feels broken","Design the error recovery for accidental micro-interactions first"] },
  { id:"scalefeature",cat:"scale",name:"Feature",sub:"Scale",img:"scale_feature.png",desc:"A complete task spanning multiple steps — compose a message, set an alarm, configure a setting.",pros:["Meaningful user goal accomplished","Allows richer interaction design","Clear start and end state"],cons:["Users can abandon mid-flow","Requires more sustained attention","Error recovery more complex"],considerations:["5-step maximum for embedded/wearable feature flows","Progress indicator reduces abandonment in multi-step flows","Save partial state — don't lose work if user is interrupted"] },
  { id:"scalesession",cat:"scale",name:"Session",sub:"Scale",img:"scale_session.png",desc:"A sustained period of active use — 5–30 minutes of continuous engagement with a purpose.",pros:["Allows complex, deeply engaging UX","User is invested — higher tolerance for learning","Rich analytics from session data"],cons:["Requires sustained battery and CPU","User comfort becomes a factor (wrist fatigue, eye strain)","Retention falls off sharply after 20 minutes without hooks"],considerations:["Ergonomics matter for session-length products — weight, heat, grip shape","Battery life must exceed typical session time with margin","Session end state should be graceful — save progress, provide summary"] },
  { id:"scaleambient",cat:"scale",name:"Ambient / Continuous",sub:"Scale",img:"scale_ambient.png",desc:"Always present, passively consumed — background displays, always-on sensors, ambient indicators.",pros:["No interaction required — information just exists","Can communicate peripheral context without demanding attention","Power of habit — users reference without consciously choosing to"],cons:["Must never demand attention unless critical","Content must stay fresh or users stop seeing it","Always-on power consumption"],considerations:["E-ink or always-on OLED ideal for ambient displays","Content update frequency should match information freshness — hourly weather, not second-by-second","Design for peripheral vision — large, high-contrast, glanceable at any angle"] },
  { id:"scaleperiodic",cat:"scale",name:"Periodic",sub:"Scale",img:"scale_periodic.png",desc:"Regular check-ins at intervals — daily review, weekly summary, hourly reminder.",pros:["Predictable and plannable for users","Batch information reduces interruption frequency","Can align with natural rhythms (morning, mealtime, bedtime)"],cons:["User must remember or be reminded","Stale between intervals","Wrong interval feels like too much or too little"],considerations:["Let users choose interval — what's perfect for one user is wrong for another","Daily digest is often better than hourly notifications","Periodic interactions work well for health, habit tracking, and maintenance workflows"] },

  // DESIGN / LEARNING CURVE
  { id:"learnintuitive",cat:"learning",name:"Intuitive",sub:"Learning",img:"learn_intuitive.png",desc:"Works correctly on first attempt with no instruction — pure affordance and prior knowledge.",pros:["Zero onboarding friction","Works for all users regardless of tech literacy","No manual or tutorial needed"],cons:["Hard to achieve for novel interactions","May limit expressiveness of interaction","Cultural assumptions embedded in 'intuitive'"],considerations:["Test with users who have no tech background to verify 'intuitive' claim","Leverage skeuomorphic cues from physical world (turn knob clockwise = increase)","If it needs a label, it is not yet intuitive — redesign the affordance"] },
  { id:"learndiscoverable",cat:"learning",name:"Discoverable",sub:"Learning",img:"learn_discoverable.png",desc:"Hidden features reveal themselves through natural exploration — progressive disclosure.",pros:["Beginner path is clean and simple","Advanced users can discover depth","No explicit teaching required"],cons:["Power features may never be found","Discovery is unpredictable across users","Hard to test effectively"],considerations:["Contextual hints on second or third use lower barriers without polluting first use","Apple's 3D Touch / press-and-hold are classic discoverable patterns","Ensure the simple path is fully functional — discovery is additive, not required"] },
  { id:"learntutorial",cat:"learning",name:"Tutorial",sub:"Learning",img:"learn_tutorial.png",desc:"Requires explicit instruction to use — onboarding flow, manual, or guided first use.",pros:["Can teach complex or novel interactions","Ensures correct mental model from start","Can be skipped by experienced users"],cons:["High friction — many users skip tutorials","Must be available in context when needed, not just at first launch","Rapidly becomes outdated with product updates"],considerations:["Interactive tutorial > video > static manual in retention","Keep to 3–5 steps maximum — longer tutorials have near-zero completion","Contextual help ('?' button) as persistent fallback after tutorial is dismissed"] },
  { id:"learnskill",cat:"learning",name:"Skill-Building",sub:"Learning",img:"learn_skill.png",desc:"Interaction that rewards practice — gets faster, easier, or more powerful with repeated use.",pros:["Creates habitual and loyal users","Expert UX can be highly efficient","Mastery is motivating — user feels capable"],cons:["High initial barrier","Casual users may never reach proficiency","Requires consistent design — changing UI resets muscle memory"],considerations:["Keyboard shortcuts on top of mouse UI is classic skill-building layer","Haptic patterns for gesture commands can become second nature in weeks","Progressive challenges or 'streaks' can accelerate skill building in consumer products"] },
  { id:"learnexpert",cat:"learning",name:"Expert",sub:"Learning",img:"learn_expert.png",desc:"Optimised for proficient users — dense UI, keyboard shortcuts, minimal hand-holding.",pros:["Maximum efficiency for trained users","Trusted by professionals — feels powerful","Users feel respected and capable"],cons:["Inaccessible to new users without training","Error recovery is harder when feedback is minimal","Intimidating to non-expert stakeholders evaluating the product"],considerations:["Always provide a beginner mode or guided fallback even in expert-first products","CLI interfaces are the ultimate expert UX — every keystroke intentional","Document the expert paths clearly — power users will share them and drive adoption"] },

  // DESIGN / POWER & PERFORMANCE
  { id:"poweron",cat:"power",name:"Always-On",sub:"Power",img:"power_alwayson.png",desc:"Device is continuously active with no sleep or idle states — instant responsiveness at all times.",pros:["Zero latency — always ready","No wake-up delay or missed events","Simplest firmware state machine"],cons:["Maximum power consumption — drains battery fastest","Highest thermal load","Requires generous power supply or short battery life"],considerations:["Only viable with wired power or large battery","E-ink + BLE combination can sustain always-on at ~1mA","Review active current carefully: WiFi module at 200mA active makes always-on battery life very short"] },
  { id:"powerwake",cat:"power",name:"Wake-on-Gesture",sub:"Power",img:"power_wake.png",desc:"System sleeps deeply and wakes only on a specific physical event — motion, tap, voice, proximity.",pros:["Excellent battery life — sleeps most of the time","Can extend battery 10–100x vs always-on","Natural interaction model for infrequently used devices"],cons:["Wake latency — user waits 0.5–2s after trigger","Missed wakes if gesture recognition is too strict","Complex firmware: sleep entry/exit, state restoration"],considerations:["Nordic nRF52 ultra-low-power sleep draws ~2µA — wakes on accelerometer tap","Display must also sleep — display often dominates power budget","Test wake sensitivity carefully — too sensitive = battery drain, too strict = frustration"] },
  { id:"powerperiodic",cat:"power",name:"Periodic Sampling",sub:"Power",img:"power_periodic.png",desc:"System wakes at intervals to take readings then sleeps again — duty cycling.",pros:["Predictable and tunable power budget","Simple to implement with RTC alarm","Captures trends without continuous monitoring overhead"],cons:["Misses events between samples","Sampling frequency determines data resolution","Phase alignment between samples and events is random"],considerations:["1-minute interval draws ~1/60th of continuous current — huge savings","Oversample (1s) then average to reduce noise in output","Store readings in circular buffer with timestamp for later upload"] },
  { id:"powerevent",cat:"power",name:"Event-Triggered",sub:"Power",img:"power_event.png",desc:"System wakes and records only when a threshold is crossed — motion detected, temperature exceeded.",pros:["Captures events precisely when they happen","Battery wasted only when something interesting occurs","High data efficiency — storage and bandwidth only for meaningful data"],cons:["Threshold setting is critical — too sensitive = constant wake, too strict = missed events","Cannot reconstruct 'nothing happened' periods from data alone","Complex interrupt logic and debouncing required"],considerations:["Hardware interrupt from sensor directly wakes MCU — no polling needed","Accelerometer interrupt for motion, comparator for threshold crossing","Log interrupt source with timestamp — essential for debugging event chains"] },
  { id:"powerlowlatency",cat:"power",name:"Low-Latency",sub:"Power",img:"power_latency.png",desc:"System optimised for minimum response time — fastest possible input-to-output pipeline.",pros:["Best user experience for interactive devices","Critical for control systems and safety","Enables real-time audio and haptic feedback"],cons:["Conflicts with power saving — fast response often requires always-on","Requires careful firmware architecture — no blocking calls","Network latency adds unpredictably to response time"],considerations:["Measure input-to-output latency, not just processing time","BLE connection interval affects wireless latency — set to 7.5ms minimum for gaming peripherals","Audio processing on-device avoids network latency entirely"] },
  { id:"powercloud",cat:"power",name:"Delayed / Cloud",sub:"Power",img:"power_cloud.png",desc:"Processing or output is deferred to cloud — batch uploads, cloud inference, server-side processing.",pros:["Offloads heavy computation from device","Unlimited storage and processing at cloud scale","Enables features impossible on-device (large ML models, cross-device correlation)"],cons:["Requires internet connectivity","Adds seconds to minutes of latency","Privacy: data leaves device","Ongoing cloud cost"],considerations:["Design for offline-first: queue locally, sync when connected","GDPR/privacy compliance is mandatory for personal data sent to cloud","Edge-cloud split: capture and filter on device, analyse in cloud — best of both"] },
];

// ── ASCII CARD GRAPHICS ────────────────────────────────────────
const CARD_GRAPHICS = {
  // Per-card overrides
  standing:     "    ◉\n    │\n   ─┼─\n    │\n   ─┴─",
  sitting:      "   ◉\n   │\n  ─┤\n   │──\n   ┘",
  wearable:     " ─╭────╮─\n  │ ◉  │\n ─╰────╯─",
  vehicle:      "  ┌───┐\n ─┤   ├─\n  ○   ○",
  phone:        "  ┌──┐\n  │  │\n  │○ │\n  └──┘",
  outdoor:      "   /\\\n  /  \\\n /────\\\n  ────",
  indoor:       "  ┌──┐\n  ┤  ├\n  ┤  ├\n  └──┘",
  social:       " ◉ ◉ ◉\n │ │ │\n─┴─┴─┴─",
  tap:          "    ▼\n   ─┼─\n    │\n   ─┴─",
  drag:         "  ◁───▷\n  │   │\n    ▽",
  shake:        " ≋  ≋  ≋\n≋  ≋  ≋ \n ≋  ≋  ≋",
  hover:        "  ·  ·  ·\n   · ◈ ·\n  ·  ·  ·",
  tilt:         " ╭────╮\n╱      ╲\n        ",
  button:       "   ╭──╮\n   │██│\n   ╰──╯\n   └──┘",
  jogwheel:     "  ╭──╮\n ─┤  ├─\n  ╰──╯\n    ↻",
  slider:       " ────┬──\n     │\n  ───────",
  joystick:     "    │\n    ◉\n  ──┘└──\n  ──────",
  keyboard:     " ┌┐┌┐┌┐\n └┘└┘└┘\n ┌─────┐\n └─────┘",
  wifi:         "  ((()))\n ((   ))\n((     ))\n    ◉",
  bluetooth:    "   ─┐\n   │╲\n   │╱\n   │╲\n   │╱\n   ─┘",
  battery:      " ┌──────┐\n─┤██████│\n─┤████░░│\n └──────┘",
  solar:        " ╔═╗╔═╗\n ╚═╝╚═╝\n     │\n    ─┴─",
  mcu:          "  ┌┬┬┬┐\n  ├┤ ├┤\n  ├┼◈┼┤\n  ├┤ ├┤\n  └┴┴┴┘",
  android:      "  ╭───╮\n  │◉ ◉│\n  │ ▽ │\n  └───┘",
  windows:      "  ┌─┬─┐\n  │▓│▓│\n  ├─┼─┤\n  │▓│▓│\n  └─┴─┘",
  nfc:          "     ─\n    ─ ─\n   ─   ─\n     ◈",
  gps:          "    /\\\n   /  \\\n  / ◈  \\\n  ──────",
  light:        "   ·*·\n  * ◉ *\n   ·*·\n    │\n    ┴",
  sound:        "    ))\n  ─▐█▌─\n    ))\n   ─┴─",
  vibration:    "  ≋ ≋ ≋\n ≋ ≋ ≋ ≋\n  ≋ ≋ ≋\n ≋ ≋ ≋ ≋",
  lcd:          " ╔═════╗\n ║ ████║\n ╚═════╝\n   ─┴─",
  eink:         "  ┌─────┐\n  │  ──  │\n  │ ─── │\n  └─────┘",
  healthsensor: "    ♡\n   ─◉─\n    │\n  ──┴──",
  soundsensor:  "   ))))\n   ▐██▌\n   ────",
  infrared:     "  ──▷\n  ──▷\n  ──▷\n    ◈",
  cloud:        " ╭──╮╮\n ╰───╮│\n     ╰╯",
  usb:          " ─┤USB├─\n  └────┘\n     │\n     ┴",
  activecooling:"  ↑↑↑\n  ─────\n  ╔═══╗\n  ╚═══╝",
  passivecooling:"▐████▌\n ──────\n▐████▌\n ──────",
  // Category fallbacks
  scenario:     "   ╭──╮\n   │◉◉│\n   ╰─┬╯\n     │\n   ──┴──",
  gesture:      "     ▽\n   ╱─╲\n  │   │\n  │   │\n   ───",
  control:      " ┌─┐ ┌─┐\n │●│ │●│\n └─┘ └─┘\n  ━━━━━",
  sensor:       "   )◈(\n  ))◈((\n )))◈(((\n   ─┴─\n   ───",
  camera:       "  ╭───╮\n  │ ◎ │\n  ╰───╯\n    ┴",
  display:      "  ╔═══╗\n  ║░▓░║\n  ║▓░▓║\n  ╚═══╝\n   ─┴─",
  feedback:     "  ≋ ≋ ≋\n ≋ ≋ ≋ ≋\n  ≋ ≋ ≋\n ≋ ≋ ≋ ≋",
  connect:      "   ◉─◉\n  ╱│ │╲\n ◉  │  ◉\n  ╲│ │╱\n   ◉─◉",
  port:         "  ┌────┐\n  │▐▌▐▌│\n  └────┘",
  charging:     "  ┌────┐\n┌─┤████│\n└─┤██░░│\n  └────┘",
  cooling:      "  ↑  ↑  ↑\n  │  │  │\n  ═══════\n  ╱╱╱╱╱╱",
  platform:     "  ┌─┬─┐\n  ├─┼─┤\n  │ ◈ │\n  ├─┼─┤\n  └─┴─┘",
  // Phase A new cards
  lying:        "   ◉\n───┼───\n   │\n───────",
  kitchen:      "  ╭───╮\n  │ ~ │\n  │~~~│\n  ╰───╯",
  healthcare:   "   ┼\n ──┼──\n   │\n  ─┴─",
  emergency:    "  ╔═══╗\n  ║ ! ║\n  ╚═══╝\n   ─┴─",
  swipe:        "  ◁━━━▷\n   ╱╲\n   ──",
  voicecmd:     "  ))) \n  ▐█▌ \n  ─── \n  ─┴─",
  eyetrack:     "  ╭───╮\n  │ ◉ │\n  ╰───╯\n  ─ ─ ─",
  headnod:      "   ◉\n  ╱│╲\n ↓ │ ↑\n   ┴",
  breathgesture:"  ))))\n  ─○─\n  )))))",
  rotarydial:   "  ╭──╮\n  │ ↻│\n  ╰──╯\n  ──┴──",
  touchscreen:  "  ╔════╗\n  ║    ║\n  ║  ✦ ║\n  ╚════╝",
  footpedal:    "  ┌────┐\n  │    │\n  └────┘\n  ──────",
  touchring:    "  ╭──╮\n ─┤◈ ├─\n  ╰──╯",
  barometric:   "   ↑↑\n  ─┼┼─\n  ─┴┴─\n  ╚══╝",
  compass:      "    N\n  W─◈─E\n    S",
  uvsensor:     "  \\│/\n  ─◉─\n  /│\\\n  ─┴─",
  rainsensor:   "  │ │ │\n ─┼─┼─┼─\n  ◈   \n  ─┴─",
  proximitysensor:" · · ·\n ·─◈─·\n · · ·",
  depthcamera:  "  ╭───╮\n  │ ◎ │\n  │···│\n  ╰───╯",
  thermalcamera:"  ┌───┐\n  │▓▓▓│\n  │░▓░│\n  └───┘",
  cam360:       " ╭─────╮\n─┤ ◎ ◎ ├─\n ╰─────╯",
  objectrecog:  "  ┌─ ─┐\n  │ ◈ │\n  └─ ─┘\n  ──┴──",
  ledmatrix:    " ●●●●●\n ●●●●●\n ●●●●●",
  projector:    "  ╔═╗\n  ║●║▷▷▷\n  ╚═╝",
  hud:          "  ╱─────╲\n ╱  ─┬─  ╲\n╱    │    ╲",
  electrotactile:"  ≈≈≈\n ─╫╫╫─\n  ≈≈≈",
  midairhaptics:"  ·•·\n •───•\n  ·•·\n  ~~~",
  olfactory:    "  ≋≋≋\n  ─◉─\n  └─┘",
  zigbee:       "  ◉─◉\n ╱   ╲\n◉     ◉\n ╲   ╱\n  ◉─◉",
  thread:       "  ◉═◉\n  ║ ║\n  ◉═◉\n  ─┴─",
  uwb:          "  ─ ─ ─\n ─ ─◈─ ─\n  ─ ─ ─\n  ~~~~~",
  linux:        "  ╭─ ─╮\n  │ λ │\n  ╰─ ─╯\n  ─────",
  rtos:         "  ┌───┐\n  │t:0│\n  │███│\n  └───┘",
  // Physical Affordance
  pressafford:  "   ╭──╮\n   │  │\n   ╰──╯\n   ─▼─",
  squeezeafford:"  ─┤  ├─\n  ─┤  ├─\n  ─┤  ├─",
  twistafford:  "  ╭──╮\n  │ ↻│\n  ╰──╯",
  slideafford:  "  ────┬\n      │\n  ────┘",
  tiltafford:   " ╭────╮\n╱       \n",
  shakeafford:  " ≋≋ ≋≋\n≋ ≋ ≋ ≋\n ≋≋ ≋≋",
  tapafford:    "    ▼\n  ──┼──\n   ─┴─",
  strokeafford: "  ~~~\n ─────\n  ~~~",
  pullaff:      "  ◎\n  │\n  │\n  ╰── ▷",
  foldafford:   "  ╱───╲\n ╱     ╲\n───────",
  coverafford:  "  ┌────┐\n  │████│\n  └────┘",
  hoverafford:  "  · · ·\n · ─◈─ ·\n  · · ·",
  blowafford:   "  ))))\n  ─○─\n  ════",
  traceafford:  "  ╭─\n  │ ╲\n  │  ╲─╮\n       │",
  pinchafford:  "  ╲ ╱\n   ╲╱\n   ╱╲\n  ╱ ╲",
  physaffordance:"  ╭──╮\n ─┤◈ ├─\n  ╰──╯",
  // Temporal Pattern
  tempinstant:  "  ─▶\n  ─▶\n  ─▶",
  tempdelayed:  "  ─ ─ ▶\n  · · ·\n  ─────",
  tempgradual:  "  ░▒▓█\n  ─────",
  temprhythmic: "  │ │ │\n  │ │ │\n  ─────",
  temppulsing:  "  ▮ ▮ ▮\n  · · ·\n  ─────",
  tempescalating:" ▪ ▮ █\n  ─────",
  tempdecaying: "  █▓▒░\n  ─────",
  temppersistent:"  ████\n  ─────",
  temptriggered:"  ▶!▶\n  ─┼─\n  ─┴─",
  tempcontinuous:"  ≈≈≈≈\n  ─────",
  tempscheduled:"  ╭──╮\n  │12│\n  ╰──╯",
  tempcontextual:"  ◐◓◑\n  ─────",
  temporal:     "  │·│·│\n  ─────",
  // Feedback Modality
  modalvisual:  "  ╔═══╗\n  ║ ▲ ║\n  ╚═══╝",
  modalaudio:   "  ))\n ─▐█▌─\n  ))\n  ─┴─",
  modalhaptic:  "  ≋≋≋\n ─╫╫╫─\n  ≋≋≋",
  modalredundant:" ▲ ))\n─╫╫╫─\n  ─┴─",
  modalcomplementary:" ▲\n ─╫─\n  ))",
  modalperipheral:"· · ·\n · ◈ ·\n· · ·",
  modalfocal:   " ╔════╗\n ║ !! ║\n ╚════╝",
  modality:     "  ◉))\n  ─┼─\n  ─┴─",
  // Material Quality
  matsoft:      "  ╭──╮\n  ╰──╯\n  ~~~~~",
  mathard:      "  ┌──┐\n  │  │\n  └──┘",
  matwarm:      "  ╭──╮\n  │♨ │\n  ╰──╯",
  matcool:      "  ┌──┐\n  │❄ │\n  └──┘",
  mattextured:  "  ││││\n  ││││\n  ────",
  matsmooth:    "  ╔══╗\n  ║  ║\n  ╚══╝",
  matflexible:  "  ╭~~╮\n  │  │\n  ╰~~╯",
  mattransparent:" ╭──╮\n ·│  │·\n ╰──╯",
  matweighted:  "  ┌──┐\n  │▓▓│\n  └──┘\n  ────",
  matlightweight:" ╭──╮\n ·│  │·\n ╰──╯\n  ────",
  material:     "  ░▒▓█\n  ─────",
  // Spatial Relationship
  spatintimate: "  ─◉─\n  ─│─\n  ───",
  spatpersonal: "  ◉\n  │\n  ─┼─\n  │",
  spatsocial:   " ◉ ─ ◉\n  ─┼─\n   │",
  spatpublic:   "◉   ◉   ◉\n ─────────",
  spatrelpos:   "  ◉←─→◉\n  ─────",
  spatorient:   "    N\n  W─◈─E\n    S\n  ─────",
  spatheight:   "  ↑\n  │\n  ◈\n  │\n  ↓",
  spatdirection:"  ◉\n  │\n  ▶───",
  spatroomscale:" ┌─────┐\n │ ◈   │\n └─────┘",
  spatboundary: "  ─ ─ ─\n─      ─\n  ─ ─ ─",
  spatial:      "  ◈\n ─┼─\n  │\n ─┴─",
  // Interaction Scale
  scalemicro:   "  ▼\n  ─\n  ·",
  scalefeature: "  ▶─▶─▶\n  ─────",
  scalesession: "  ▶────\n  │████\n  ─────",
  scaleambient: "  · ◈ ·\n ·     ·\n  · · ·",
  scaleperiodic:"  │ │ │\n  ─────\n  ◷ ◷ ◷",
  scale:        "  ·─●─█\n  ─────",
  // Learning Curve
  learnintuitive: "  ◉→✓\n  ───",
  learndiscoverable:" ◉\n ─┼─\n  │\n  ?",
  learntutorial:"  ①②③\n  ───",
  learnskill:   "  /\n /\n/─────",
  learnexpert:  "  >_\n  ───",
  learning:     "  ╱\n ╱\n╱────",
  // Power & Performance
  poweron:      "  ████\n  ─────",
  powerwake:    "  Zzz\n  ─◉─\n  ─┴─",
  powerperiodic:"  │ │ │\n  ─────\n  ◷ ◷",
  powerevent:   "  ─ ─!─\n  ─────",
  powerlowlatency:" ▶▶\n ──\n ──",
  powercloud:   "  ↑\n ─◉─\n ╭──╮\n ╰──╯",
  power:        "  ╔══╗\n  ║⚡║\n  ╚══╝",
};

// ── CATEGORY DEFINITIONS ──────────────────────────────────────
const CATEGORIES = {
  scenario:      { label:"Scenario",   color:"#F9BCCF", group:"context" },
  gesture:       { label:"Gesture",    color:"#FFCF87", group:"input" },
  control:       { label:"Control",    color:"#FFA98B", group:"input" },
  sensor:        { label:"Sensor",     color:"#C8B8FF", group:"input" },
  camera:        { label:"Camera",     color:"#97C3FF", group:"input" },
  display:       { label:"Display",    color:"#7FD4FF", group:"output" },
  feedback:      { label:"Feedback",   color:"#7FEEED", group:"output" },
  connect:       { label:"Connect",    color:"#7FE8B4", group:"enable" },
  port:          { label:"Port",       color:"#5DD89A", group:"enable" },
  charging:      { label:"Charging",   color:"#FFE066", group:"enable" },
  cooling:       { label:"Cooling",    color:"#9EC8E4", group:"enable" },
  platform:      { label:"Platform",   color:"#D4FF59", group:"enable" },
  physaffordance:{ label:"Affordance", color:"#FF8FAE", group:"pattern" },
  temporal:      { label:"Temporal",   color:"#B8A4FF", group:"pattern" },
  modality:      { label:"Modality",   color:"#88BBFF", group:"pattern" },
  material:      { label:"Material",   color:"#FFD27A", group:"form" },
  spatial:       { label:"Spatial",    color:"#5EDBA8", group:"form" },
  scale:         { label:"Scale",      color:"#FFB27A", group:"design" },
  learning:      { label:"Learning",   color:"#EE8AFF", group:"design" },
  power:         { label:"Power",      color:"#A4B8CC", group:"design" },
};

const GROUPS = {
  context: { label:"SCENARIO", color:"#F9BCCF" },
  input:   { label:"INPUT",    color:"#FFCF87" },
  output:  { label:"OUTPUT",   color:"#7FD4FF" },
  enable:  { label:"ENABLE",   color:"#7FE8B4" },
  pattern: { label:"PATTERN",  color:"#FF8FAE" },
  form:    { label:"FORM",     color:"#FFD27A" },
  design:  { label:"DESIGN",   color:"#FFB27A" },
};

// ── DEPENDENCY RULES ──────────────────────────────────────────
const DEPENDENCIES = [
  { if:["wifi"],needs:["mcu"],msg:"WiFi requires a microcontroller to manage network stack." },
  { if:["wifi"],needs:["battery","wiredcharge","solar","wireless"],msg:"WiFi needs a power source — it draws 80-200mA active.",any:true },
  { if:["bluetooth"],needs:["mcu"],msg:"Bluetooth requires MCU with BLE stack." },
  { if:["bluetooth"],needs:["battery","wiredcharge","solar","wireless"],msg:"Bluetooth needs power (though BLE is very efficient).",any:true },
  { if:["gps"],needs:["battery","solar"],msg:"GPS draws 30-50mA continuously — needs portable power.",any:true },
  { if:["gps"],needs:["mcu"],msg:"GPS module needs MCU to process NMEA data." },
  { if:["lcd"],needs:["mcu","android","windows"],msg:"LCD display needs a processor to drive content.",any:true },
  { if:["lcd"],needs:["battery","wiredcharge"],msg:"LCD screens are power-hungry — plan your power budget.",any:true },
  { if:["eink"],needs:["mcu"],msg:"E-ink needs MCU for partial refresh control." },
  { if:["cloud"],needs:["wifi","cellular","wirednetwork"],msg:"Cloud services require internet connectivity.",any:true },
  { if:["cellular"],needs:["antenna"],msg:"Cellular needs an antenna with specific band coverage." },
  { if:["cellular"],needs:["battery","wiredcharge"],msg:"Cellular radio draws significant power.",any:true },
  { if:["lora"],needs:["antenna"],msg:"LoRa requires a tuned antenna (typically 868/915MHz)." },
  { if:["lora"],needs:["mcu"],msg:"LoRa module needs MCU for packet management." },
  { if:["healthsensor"],needs:["mcu"],msg:"Health sensors need MCU for signal processing (PPG, ECG algorithms)." },
  { if:["soundsensor"],needs:["mcu"],msg:"Sound sensor/microphone needs MCU for audio processing." },
  { if:["android"],needs:["battery","wiredcharge"],msg:"Android platform needs substantial power.",any:true },
  { if:["activecooling"],needs:["battery","wiredcharge"],msg:"Active cooling (fans) needs power.",any:true },
  { if:["solar"],suggests:["outdoor"],msg:"Solar charging works best in outdoor scenarios." },
  { if:["wearable"],suggests:["bluetooth"],msg:"Wearables typically pair with a phone via BLE." },
  { if:["wearable"],suggests:["battery"],msg:"Wearables need portable power." },
  { if:["vehicle"],suggests:["wiredcharge"],msg:"Vehicles provide 12V power — wired charging available." },
  { if:["outdoor"],suggests:["passivecooling"],msg:"Outdoor environments may need thermal management." },
];

// ── EXAMPLE PROFILES ──────────────────────────────────────────
const PROFILES = [
  { name:"Cycling Nav Band", desc:"Wrist-worn haptic navigation for cyclists. No screen — vibration patterns indicate turns. BLE paired with phone for route data.", cards:["mobile","outdoor","wearable","tap","tilt","shake","motionsensor","healthsensor","vibration","light","bluetooth","gps","battery","mcu","passivecooling"], color:"#E8A0BF" },
  { name:"Smart Payment Terminal", desc:"Connected POS device with touchscreen, NFC, and multiple connectivity options. Based on Ingenico/Worldline architecture.", cards:["stationary","indoor","individual","tap","multitouch","button","lightsensor","lcd","sound","light","vibration","wifi","bluetooth","nfc","cellular","usb","battery","wiredcharge","mcu","android","passivecooling"], color:"#D4A98C" },
  { name:"Air Quality Monitor", desc:"Indoor environmental sensor hub. E-ink display, WiFi connected, cloud dashboard. Silent, always-on.", cards:["stationary","indoor","individual","tap","airsensor","tempsensor","humidity","gassensor","lightsensor","eink","light","wifi","cloud","usb","wiredcharge","mcu","passivecooling"], color:"#8CC5A0" },
  { name:"Smart Retail Tag", desc:"BLE beacon with e-ink price display. Battery powered, long life, cloud-managed inventory.", cards:["stationary","indoor","social","beacon","eink","light","bluetooth","nfc","cloud","battery","mcu"], color:"#8BAFC4" },
];

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function EETIToolkit() {
  const [view, setView] = useState("home"); // home | build | analysis | profiles
  const [selected, setSelected] = useState(new Set());
  const [activeCat, setActiveCat] = useState("scenario");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [projectName, setProjectName] = useState("Untitled Project");

  const toggle = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const flipCard = useCallback((id) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const loadProfile = useCallback((p) => {
    setSelected(new Set(p.cards));
    setProjectName(p.name);
    setView("build");
  }, []);

  // ── Dependency analysis ──
  const analysis = useMemo(() => {
    const gaps = [];
    const suggestions = [];
    DEPENDENCIES.forEach(rule => {
      const triggered = rule.if.some(id => selected.has(id));
      if (!triggered) return;
      const triggerNames = rule.if.filter(id => selected.has(id)).map(id => CARDS.find(c=>c.id===id)?.name);
      if (rule.needs) {
        const met = rule.any ? rule.needs.some(id => selected.has(id)) : rule.needs.every(id => selected.has(id));
        if (!met) {
          const needed = rule.needs.map(id => CARDS.find(c=>c.id===id)?.name).filter(Boolean);
          gaps.push({ trigger: triggerNames.join(", "), needs: needed.join(rule.any?" or ":" + "), msg: rule.msg, needIds: rule.needs, any: rule.any });
        }
      }
      if (rule.suggests) {
        const met = rule.suggests.some(id => selected.has(id));
        if (!met) {
          const suggested = rule.suggests.map(id => CARDS.find(c=>c.id===id)?.name).filter(Boolean);
          suggestions.push({ trigger: triggerNames.join(", "), suggests: suggested.join(", "), msg: rule.msg, suggestIds: rule.suggests });
        }
      }
    });
    return { gaps, suggestions };
  }, [selected]);

  const selectedCards = useMemo(() => CARDS.filter(c => selected.has(c.id)), [selected]);
  const filteredCards = useMemo(() => {
    let cards = CARDS.filter(c => c.cat === activeCat);
    if (search) cards = cards.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));
    return cards;
  }, [activeCat, search]);

  const countByCat = useMemo(() => {
    const m = {};
    selected.forEach(id => {
      const c = CARDS.find(x=>x.id===id);
      if (c) m[c.cat] = (m[c.cat]||0)+1;
    });
    return m;
  }, [selected]);

  // ── STYLES ────────────────────────────────────────────────
  const bg = "#F5F4F0";
  const surface = "#FFFFFF";
  const surfaceHover = "#EDEDEA";
  const border = "#1A1A1A";
  const borderLight = "#DDDBD6";
  const text = "#0F0F0F";
  const textDim = "#716F6C";

  const s = {
    root: { fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:bg, color:text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
    mono: { fontFamily:"'IBM Plex Mono',monospace" },
    nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:`2px solid ${border}`, background:surface },
    logo: { fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:700, letterSpacing:"0.2em", color:border },
    navLinks: { display:"flex", gap:4 },
    navBtn: (active) => ({ padding:"8px 16px", borderRadius:4, border:"none", background:active?border:"transparent", color:active?surface:textDim, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em", textTransform:"uppercase", transition:"all 0.15s" }),
    sidebar: { width:220, borderRight:`1px solid ${border}`, padding:"16px 0", overflowY:"auto", flexShrink:0, background:surface },
    catBtn: (active, catColor) => ({ width:"100%", padding:"10px 20px", border:"none", borderLeft: active ? `3px solid ${catColor}` : "3px solid transparent", background:"transparent", color:active?text:textDim, fontSize:13, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'IBM Plex Sans',sans-serif", transition:"all 0.1s" }),
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, padding:20, alignItems:"start" },
    card: (sel) => ({ background:sel?surfaceHover:surface, border:`${sel?"2.5px":"1.5px"} solid ${border}`, borderRadius:6, overflow:"hidden", cursor:"pointer", transition:"all 0.15s", position:"relative" }),
    tag: (color) => ({ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:600, background:color+"33", color:"#1A1A1A", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em" }),
    badge: { position:"absolute", top:10, right:10, width:10, height:10, borderRadius:"50%", background:border },
    panel: { background:surface, border:`1px solid ${border}`, borderRadius:6, padding:20, marginBottom:16 },
    btnPrimary: { padding:"10px 24px", borderRadius:0, border:"none", background:border, color:surface, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em", textTransform:"uppercase" },
    btnSecondary: { padding:"10px 24px", borderRadius:0, border:`1.5px solid ${border}`, background:"transparent", color:text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em", textTransform:"uppercase" },
    selTray: { position:"fixed", bottom:0, left:0, right:0, background:border, borderTop:`2px solid ${border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:100 },
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      {/* NAV */}
      <div style={s.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={s.logo}>▸ EETI</span>
          <span style={{ fontSize:11, color:textDim, ...s.mono }}>Embedded Embodied Tangible Interactions</span>
        </div>
        <div style={s.navLinks}>
          {[["home","Home"],["build","Build"],["analysis","Analysis"],["profiles","Profiles"]].map(([v,l])=>(
            <button key={v} style={s.navBtn(view===v)} onClick={()=>setView(v)}>{l}</button>
          ))}
          {selected.size > 0 && (
            <button style={{ ...s.navBtn(false), color:"#f66" }} onClick={()=>{setSelected(new Set());setProjectName("Untitled Project")}}>Reset</button>
          )}
        </div>
      </div>

      {/* HOME VIEW */}
      {view === "home" && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:56, fontWeight:400, fontStyle:"italic", lineHeight:1.1, marginBottom:16, color:text }}>
            Design with<br/><span style={{ color:lime }}>every sense</span>
          </h1>
          <p style={{ fontSize:17, color:textDim, maxWidth:540, margin:"0 auto 48px", lineHeight:1.7 }}>
            A toolkit for exploring embedded technology possibilities in connected product design. Select components, understand their design impact, and discover how they work together.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:64 }}>
            <button style={s.btnPrimary} onClick={()=>setView("build")}>Start Building →</button>
            <button style={s.btnSecondary} onClick={()=>setView("profiles")}>Load Example</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, textAlign:"left" }}>
            {Object.entries(GROUPS).map(([k,g])=>(
              <div key={k} style={{ ...s.panel, borderTop:`2px solid ${g.color}` }}>
                <div style={{ ...s.mono, fontSize:11, color:g.color, fontWeight:600, marginBottom:8, letterSpacing:"0.1em" }}>{g.label}</div>
                <div style={{ fontSize:13, color:textDim }}>
                  {Object.entries(CATEGORIES).filter(([,v])=>v.group===k).map(([,v])=>v.label).join(" · ")}
                </div>
                <div style={{ ...s.mono, fontSize:22, fontWeight:700, marginTop:12, color:text }}>
                  {CARDS.filter(c=>CATEGORIES[c.cat]?.group===k).length}
                </div>
                <div style={{ fontSize:11, color:textDim }}>components</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUILD VIEW */}
      {view === "build" && (
        <div style={{ display:"flex", height:"calc(100vh - 57px)" }}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            <div style={{ padding:"0 20px 12px", ...s.mono, fontSize:11, color:textDim, letterSpacing:"0.1em" }}>CATEGORIES</div>
            {Object.entries(GROUPS).map(([gk,g])=>(
              <div key={gk}>
                <div style={{ padding:"8px 20px 4px", ...s.mono, fontSize:10, color:g.color, letterSpacing:"0.15em", fontWeight:600 }}>{g.label}</div>
                {Object.entries(CATEGORIES).filter(([,v])=>v.group===gk).map(([ck,cv])=>(
                  <button key={ck} style={s.catBtn(activeCat===ck)} onClick={()=>{setActiveCat(ck);setSearch("")}}>
                    <span>{cv.label}</span>
                    {countByCat[ck] > 0 && <span style={{ ...s.mono, fontSize:11, color:lime, fontWeight:700 }}>{countByCat[ck]}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
            <div style={{ padding:"20px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <span style={{ ...s.mono, fontSize:12, color:CATEGORIES[activeCat]?.color, letterSpacing:"0.1em", fontWeight:600 }}>
                  {GROUPS[CATEGORIES[activeCat]?.group]?.label} / {CATEGORIES[activeCat]?.label.toUpperCase()}
                </span>
                <span style={{ ...s.mono, fontSize:11, color:textDim, marginLeft:12 }}>
                  {filteredCards.length} components
                </span>
              </div>
              <input
                type="text" placeholder="Search..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={{ padding:"8px 14px", borderRadius:6, border:`1px solid ${border}`, background:surfaceLight, color:text, fontSize:13, width:200, outline:"none", ...s.mono }}
              />
            </div>

            <div style={s.grid}>
              {filteredCards.map((card,i) => {
                const sel = selected.has(card.id);
                const flipped = flippedCards.has(card.id);
                const catColor = CATEGORIES[card.cat]?.color || "#888";
                const graphic = CARD_GRAPHICS[card.id] || CARD_GRAPHICS[card.cat] || "   ·\n  ···\n   ·";
                const ink = "#0D0D0D";
                const inkMid = "rgba(0,0,0,0.55)";
                const inkFaint = "rgba(0,0,0,0.28)";
                const inkBg = "rgba(0,0,0,0.07)";

                return (
                  <div key={card.id} style={{ height:340, perspective:"1000px", animation:`fadeIn 0.2s ease ${i*30}ms both` }}>
                    <div style={{
                      position:"relative", height:"100%",
                      transformStyle:"preserve-3d",
                      transition:"transform 0.48s cubic-bezier(0.4,0,0.2,1)",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}>

                      {/* ── FRONT FACE ── */}
                      <div
                        onClick={() => flipCard(card.id)}
                        style={{
                          position:"absolute", top:0, left:0, right:0, bottom:0,
                          backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          background:catColor, borderRadius:12,
                          padding:"14px 15px", overflow:"hidden",
                          cursor:"pointer", display:"flex", flexDirection:"column",
                          boxShadow: sel ? `0 0 0 2.5px ${ink}` : "0 1px 4px rgba(0,0,0,0.15)",
                          transition:"box-shadow 0.15s"
                        }}
                      >
                        {/* Sub-label + select button */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ ...s.mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, textTransform:"uppercase" }}>{card.sub}</span>
                          <button
                            onClick={e => { e.stopPropagation(); toggle(card.id); }}
                            style={{
                              width:22, height:22, borderRadius:"50%", flexShrink:0,
                              border:`2px solid ${sel ? ink : "rgba(0,0,0,0.22)"}`,
                              background: sel ? ink : "transparent",
                              color: sel ? catColor : "rgba(0,0,0,0.4)",
                              cursor:"pointer", fontSize:12, fontWeight:700,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              lineHeight:1, padding:0, transition:"all 0.15s"
                            }}
                          >{sel ? "✓" : "+"}</button>
                        </div>

                        {/* ASCII graphic */}
                        <pre style={{
                          fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:1.38,
                          margin:"0 0 11px", padding:"10px 12px",
                          background:inkBg, borderRadius:7,
                          color:inkMid, overflow:"hidden", whiteSpace:"pre",
                          flexShrink:0
                        }}>{graphic}</pre>

                        {/* Name */}
                        <div style={{ fontSize:17, fontWeight:700, color:ink, letterSpacing:"-0.01em", marginBottom:5, lineHeight:1.2 }}>{card.name}</div>

                        {/* Description */}
                        <div style={{ fontSize:12, lineHeight:1.55, color:"rgba(0,0,0,0.6)", flex:1, overflow:"hidden" }}>{card.desc}</div>

                        {/* Flip hint */}
                        <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                          <span style={{ ...s.mono, fontSize:9, color:inkFaint, letterSpacing:"0.06em" }}>flip for pros / cons</span>
                          <span style={{ ...s.mono, fontSize:10, color:inkFaint }}>↺</span>
                        </div>
                      </div>

                      {/* ── BACK FACE ── */}
                      <div
                        onClick={() => flipCard(card.id)}
                        style={{
                          position:"absolute", top:0, left:0, right:0, bottom:0,
                          backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
                          transform:"rotateY(180deg)",
                          background:catColor, borderRadius:12,
                          padding:"14px 15px", overflow:"hidden",
                          cursor:"pointer", display:"flex", flexDirection:"column"
                        }}
                      >
                        {/* Back header */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:ink, lineHeight:1.2 }}>{card.name}</div>
                          <span style={{ ...s.mono, fontSize:9, color:inkFaint, letterSpacing:"0.06em" }}>↺ flip</span>
                        </div>

                        <div style={{ height:1, background:"rgba(0,0,0,0.12)", marginBottom:11 }} />

                        {/* Pros */}
                        <div style={{ marginBottom:10 }}>
                          <div style={{ ...s.mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, marginBottom:7 }}>PROS</div>
                          {card.pros.map((p,j) => (
                            <div key={j} style={{ fontSize:11, marginBottom:5, display:"flex", gap:7, alignItems:"flex-start", lineHeight:1.45 }}>
                              <span style={{ ...s.mono, color:"rgba(0,0,0,0.35)", flexShrink:0, fontWeight:600 }}>[+]</span>
                              <span style={{ color:"rgba(0,0,0,0.72)" }}>{p}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ height:1, background:"rgba(0,0,0,0.12)", marginBottom:11 }} />

                        {/* Cons */}
                        <div style={{ flex:1, overflow:"auto" }}>
                          <div style={{ ...s.mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, marginBottom:7 }}>CONS</div>
                          {card.cons.map((p,j) => (
                            <div key={j} style={{ fontSize:11, marginBottom:5, display:"flex", gap:7, alignItems:"flex-start", lineHeight:1.45 }}>
                              <span style={{ ...s.mono, color:"rgba(0,0,0,0.35)", flexShrink:0, fontWeight:600 }}>[–]</span>
                              <span style={{ color:"rgba(0,0,0,0.72)" }}>{p}</span>
                            </div>
                          ))}
                        </div>

                        {/* Vertical category label */}
                        <div style={{
                          position:"absolute", right:10, top:"50%",
                          writingMode:"vertical-rl", transform:"translateY(-50%) rotate(180deg)",
                          ...s.mono, fontSize:8, fontWeight:700, letterSpacing:"0.22em",
                          color:"rgba(0,0,0,0.14)", whiteSpace:"nowrap", pointerEvents:"none"
                        }}>{card.sub.toUpperCase()}</div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar: Selection + warnings */}
          <div style={{ width:280, borderLeft:`1px solid ${border}`, overflowY:"auto", paddingBottom:80, flexShrink:0 }}>
            <div style={{ padding:"16px 16px 8px", ...s.mono, fontSize:11, color:textDim, letterSpacing:"0.1em", display:"flex", justifyContent:"space-between" }}>
              <span>SELECTION</span>
              <span style={{ color:lime }}>{selected.size}</span>
            </div>
            {selected.size === 0 ? (
              <div style={{ padding:16, fontSize:13, color:textDim }}>Click cards to select components for your product concept.</div>
            ) : (
              <>
                {Object.entries(GROUPS).map(([gk,g])=>{
                  const groupCards = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk);
                  if (!groupCards.length) return null;
                  return (
                    <div key={gk} style={{ padding:"8px 16px" }}>
                      <div style={{ ...s.mono, fontSize:10, color:g.color, letterSpacing:"0.15em", marginBottom:4 }}>{g.label}</div>
                      {groupCards.map(c=>(
                        <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0" }}>
                          <span style={{ fontSize:12 }}>{c.name}</span>
                          <button style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:14, padding:"0 4px" }} onClick={()=>toggle(c.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {/* Inline warnings */}
                {analysis.gaps.length > 0 && (
                  <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}`, marginTop:8 }}>
                    <div style={{ ...s.mono, fontSize:10, color:"#F90", letterSpacing:"0.1em", marginBottom:8 }}>⚠ DEPENDENCIES</div>
                    {analysis.gaps.map((g,i)=>(
                      <div key={i} style={{ fontSize:11, color:textDim, marginBottom:8, paddingLeft:8, borderLeft:"2px solid #F90" }}>
                        <div style={{ color:"#F90", fontWeight:600 }}>{g.trigger}</div>
                        <div>{g.msg}</div>
                        <div style={{ color:"#888", marginTop:2 }}>needs: {g.needs}</div>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.suggestions.length > 0 && (
                  <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}` }}>
                    <div style={{ ...s.mono, fontSize:10, color:"#69F", letterSpacing:"0.1em", marginBottom:8 }}>💡 SUGGESTIONS</div>
                    {analysis.suggestions.map((sg,i)=>(
                      <div key={i} style={{ fontSize:11, color:textDim, marginBottom:8, paddingLeft:8, borderLeft:"2px solid #69F" }}>
                        <div>{sg.msg}</div>
                        <div style={{ marginTop:4 }}>
                          {sg.suggestIds.map(sid => {
                            const sc = CARDS.find(c=>c.id===sid);
                            return sc ? (
                              <button key={sid} onClick={()=>toggle(sid)} style={{ ...s.mono, fontSize:10, padding:"3px 8px", borderRadius:4, border:`1px solid #69F`, background:"transparent", color:"#69F", cursor:"pointer", marginRight:4, marginTop:2 }}>
                                + {sc.name}
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ padding:"12px 16px" }}>
                  <button style={s.btnPrimary} onClick={()=>setView("analysis")}>View Full Analysis →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ANALYSIS VIEW */}
      {view === "analysis" && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:32 }}>
            <div>
              <div style={{ ...s.mono, fontSize:11, color:lime, letterSpacing:"0.15em", marginBottom:4 }}>ANALYSIS</div>
              <input
                value={projectName} onChange={e=>setProjectName(e.target.value)}
                style={{ fontFamily:"'Instrument Serif',serif", fontSize:36, fontWeight:400, fontStyle:"italic", background:"transparent", border:"none", color:text, outline:"none", width:"100%" }}
              />
            </div>
            <span style={{ ...s.mono, fontSize:13, color:textDim }}>{selected.size} components</span>
          </div>

          {selected.size === 0 ? (
            <div style={s.panel}>
              <p style={{ color:textDim }}>No components selected. Go to <button style={{ color:lime, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }} onClick={()=>setView("build")}>Build</button> to start selecting, or load a <button style={{ color:lime, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }} onClick={()=>setView("profiles")}>Profile</button>.</p>
            </div>
          ) : (
            <>
              {/* Selected cards by group */}
              <div style={s.panel}>
                <div style={{ ...s.mono, fontSize:11, color:textDim, letterSpacing:"0.1em", marginBottom:16 }}>COMPONENT MAP</div>
                {Object.entries(GROUPS).map(([gk,g])=>{
                  const gc = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk);
                  if (!gc.length) return null;
                  return (
                    <div key={gk} style={{ marginBottom:16 }}>
                      <div style={{ ...s.mono, fontSize:10, color:g.color, letterSpacing:"0.15em", marginBottom:8 }}>{g.label}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {gc.map(c=>(
                          <span key={c.id} style={{ padding:"6px 12px", borderRadius:6, background:CATEGORIES[c.cat]?.color+"15", border:`1px solid ${CATEGORIES[c.cat]?.color}44`, fontSize:12, fontWeight:500 }}>{c.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dependency Gaps */}
              {analysis.gaps.length > 0 && (
                <div style={{ ...s.panel, borderColor:"#F90" }}>
                  <div style={{ ...s.mono, fontSize:11, color:"#F90", letterSpacing:"0.1em", marginBottom:16 }}>⚠ DEPENDENCY GAPS — {analysis.gaps.length} issues</div>
                  {analysis.gaps.map((g,i)=>(
                    <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<analysis.gaps.length-1?`1px solid ${border}`:"none" }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{g.trigger}</div>
                      <div style={{ fontSize:13, color:textDim, marginBottom:6 }}>{g.msg}</div>
                      <div style={{ ...s.mono, fontSize:12, color:"#F90" }}>Missing: {g.needs}</div>
                      <div style={{ marginTop:8, display:"flex", gap:6 }}>
                        {g.needIds.map(nid => {
                          const nc = CARDS.find(c=>c.id===nid);
                          return nc ? (
                            <button key={nid} onClick={()=>toggle(nid)} style={{ ...s.mono, fontSize:11, padding:"4px 10px", borderRadius:4, border:"1px solid #F90", background:"transparent", color:"#F90", cursor:"pointer" }}>
                              + Add {nc.name}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div style={{ ...s.panel, borderColor:"#69F" }}>
                  <div style={{ ...s.mono, fontSize:11, color:"#69F", letterSpacing:"0.1em", marginBottom:16 }}>💡 SUGGESTIONS</div>
                  {analysis.suggestions.map((sg,i)=>(
                    <div key={i} style={{ marginBottom:12, fontSize:13, color:textDim }}>
                      <span>{sg.msg}</span>
                      <div style={{ marginTop:6 }}>
                        {sg.suggestIds.map(sid => {
                          const sc = CARDS.find(c=>c.id===sid);
                          return sc ? (
                            <button key={sid} onClick={()=>toggle(sid)} style={{ ...s.mono, fontSize:11, padding:"4px 10px", borderRadius:4, border:"1px solid #69F", background:"transparent", color:"#69F", cursor:"pointer", marginRight:6 }}>
                              + {sc.name}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {analysis.gaps.length === 0 && (
                <div style={{ ...s.panel, borderColor:lime }}>
                  <div style={{ ...s.mono, fontSize:11, color:lime, letterSpacing:"0.1em", marginBottom:8 }}>✓ ALL DEPENDENCIES MET</div>
                  <div style={{ fontSize:14, color:textDim }}>All selected components have their required dependencies covered. Your combination is technically viable.</div>
                </div>
              )}

              {/* Coverage check */}
              <div style={s.panel}>
                <div style={{ ...s.mono, fontSize:11, color:textDim, letterSpacing:"0.1em", marginBottom:16 }}>COVERAGE CHECK</div>
                {Object.entries(GROUPS).map(([gk,g])=>{
                  const gc = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk);
                  const empty = gc.length === 0;
                  return (
                    <div key={gk} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                      <span style={{ ...s.mono, fontSize:20, color:empty?"#F90":lime }}>{empty?"○":"●"}</span>
                      <span style={{ fontSize:13, color:empty?"#F90":textDim }}>{g.label}: {gc.length === 0 ? "No components selected" : `${gc.length} selected`}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* PROFILES VIEW */}
      {view === "profiles" && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ ...s.mono, fontSize:11, color:lime, letterSpacing:"0.15em", marginBottom:8 }}>EXAMPLE PROFILES</div>
          <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, fontWeight:400, fontStyle:"italic", marginBottom:8 }}>Learn from real combinations</h2>
          <p style={{ fontSize:14, color:textDim, marginBottom:32 }}>Load a profile to see how components work together in real product concepts. Modify them to explore alternatives.</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {PROFILES.map((p,i) => (
              <div key={i} style={{ ...s.panel, borderTop:`2px solid ${p.color}` }}>
                <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{p.name}</div>
                <div style={{ fontSize:12, color:textDim, marginBottom:12, lineHeight:1.6 }}>{p.desc}</div>
                <div style={{ ...s.mono, fontSize:11, color:textDim, marginBottom:12 }}>{p.cards.length} components</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:16 }}>
                  {p.cards.slice(0,8).map(cid => {
                    const c = CARDS.find(x=>x.id===cid);
                    return c ? <span key={cid} style={{ padding:"2px 8px", borderRadius:4, fontSize:10, background:surface, border:`1px solid ${border}`, ...s.mono }}>{c.name}</span> : null;
                  })}
                  {p.cards.length > 8 && <span style={{ padding:"2px 8px", fontSize:10, color:textDim, ...s.mono }}>+{p.cards.length-8} more</span>}
                </div>
                <button style={s.btnPrimary} onClick={()=>loadProfile(p)}>Load Profile →</button>
              </div>
            ))}
          </div>

          <div style={{ ...s.panel, marginTop:24, borderStyle:"dashed" }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>+ Build your own</div>
            <div style={{ fontSize:13, color:textDim, marginBottom:12 }}>Start from scratch and select components that match your design brief.</div>
            <button style={s.btnSecondary} onClick={()=>setView("build")}>Start from scratch →</button>
          </div>
        </div>
      )}

      {/* FLOATING TRAY */}
      {selected.size > 0 && view === "build" && (
        <div style={s.selTray}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ ...s.mono, fontSize:13, color:lime, fontWeight:700 }}>{selected.size}</span>
            <span style={{ fontSize:13, color:textDim }}>components selected</span>
            <div style={{ display:"flex", gap:4, marginLeft:8 }}>
              {Object.entries(GROUPS).map(([gk,g])=>{
                const n = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk).length;
                return n > 0 ? <span key={gk} style={{ ...s.mono, fontSize:10, padding:"2px 6px", borderRadius:4, background:g.color+"22", color:g.color }}>{g.label} {n}</span> : null;
              })}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {analysis.gaps.length > 0 && (
              <span style={{ ...s.mono, fontSize:11, color:"#F90", display:"flex", alignItems:"center", gap:4 }}>⚠ {analysis.gaps.length} gaps</span>
            )}
            <button style={s.btnPrimary} onClick={()=>setView("analysis")}>Analysis →</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        *::-webkit-scrollbar { width:6px }
        *::-webkit-scrollbar-track { background:${bg} }
        *::-webkit-scrollbar-thumb { background:${border}; border-radius:3px }
        input::placeholder { color:${textDim} }
        pre { margin:0 }
      `}</style>
    </div>
  );
}
