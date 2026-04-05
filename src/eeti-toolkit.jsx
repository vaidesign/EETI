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

  // INPUT / CAMERA (peach)
  { id:"codetracking",cat:"camera",name:"Code Tracking",sub:"Camera",img:"input_codetracking.png",desc:"Barcode/QR scanning via camera. Links physical to digital.",pros:["Low cost","Rich data encoding"],cons:["Needs camera + processing","Lighting dependent"],considerations:["QR codes are more robust than barcodes","Consider autofocus speed for scanning UX"] },
  { id:"gazetracking",cat:"camera",name:"Gaze Tracking",sub:"Camera",img:"input_gazetracking.png",desc:"Eye tracking via IR cameras. Knows where the user is looking.",pros:["Hands-free input","Attention awareness"],cons:["Expensive","Calibration per user","Privacy concerns"],considerations:["Near-IR illumination needed","Consider glasses/contacts compatibility"] },
  { id:"headtracking",cat:"camera",name:"Head Tracking",sub:"Camera",img:"input_headtracking.png",desc:"Tracks head position and rotation. Nod, shake, look-direction.",pros:["Hands-free control","Natural gestures"],cons:["Camera or IMU required","Limited vocabulary"],considerations:["Nod/shake for yes/no is cross-cultural","Combine with gaze for rich interaction"] },
  { id:"motiontracking",cat:"camera",name:"Motion Tracking",sub:"Camera",img:"input_motiontracking.png",desc:"Full body or limb tracking via camera or IMU array.",pros:["Rich spatial data","Activity recognition"],cons:["Processing intensive","Privacy concerns"],considerations:["Depth cameras improve accuracy","Edge processing for privacy"] },
  { id:"handtracking",cat:"camera",name:"Hand Tracking",sub:"Camera",img:"input_handtracking.png",desc:"Tracks hand position, finger pose, and gestures in 3D space.",pros:["Natural gestural input","No wearable needed"],cons:["Occlusion issues","Processing heavy"],considerations:["Depth sensor improves robustness","Define clear gesture vocabulary to avoid confusion"] },
  { id:"fingerprint",cat:"camera",name:"Finger Print",sub:"Camera",img:"input_fingerprint.png",desc:"Biometric identification via fingerprint scanning.",pros:["Secure authentication","Fast","Personal"],cons:["Wet/dirty fingers fail","Spoofing risk"],considerations:["Capacitive vs optical vs ultrasonic","Consider fallback authentication method"] },

  // OUTPUT / DISPLAY (blue)
  { id:"lcd",cat:"display",name:"LCD/LED Screen",sub:"Display",img:"output_lcdledscreen.png",desc:"Full-color active display. Rich visual output with backlighting.",pros:["Full color","Dynamic content","High brightness"],cons:["Power hungry","Fragile","Glare"],considerations:["Size vs resolution tradeoff","Consider sunlight readability","Touch integration adds cost"] },
  { id:"eink",cat:"display",name:"E-ink Screen",sub:"Display",img:"output_einkscreen.png",desc:"Bistable display — holds image without power. Paper-like readability.",pros:["Ultra low power","Excellent readability","No backlight glare"],cons:["Slow refresh","Limited/no color","No video"],considerations:["Perfect for status displays","Partial refresh for faster updates","Deep black levels, high contrast"] },
  { id:"segment",cat:"display",name:"Segment Screen",sub:"Display",img:"output_segementscreen.png",desc:"Seven-segment or custom segment display. Numbers and simple icons.",pros:["Very low power","High visibility","Simple driver"],cons:["Limited character set","No graphics"],considerations:["LED segments for brightness, LCD for power saving","Custom segments can show icons"] },
  { id:"flexscreen",cat:"display",name:"Flexible Screen",sub:"Display",img:"output_flexiblescreen.png",desc:"Bendable OLED or e-paper. Conforms to curved surfaces.",pros:["Curved/organic form factors","Thin, lightweight"],cons:["Expensive","Limited sizes","Durability concerns"],considerations:["Consider bend radius limits","Connector design for flex zone"] },
  { id:"transparentscreen",cat:"display",name:"Transparent Screen",sub:"Display",img:"output_trasparentscreen.png",desc:"See-through display. Overlays digital on physical world.",pros:["Augmented reality without headset","Preserves visual context"],cons:["Low contrast","Very expensive","Limited brightness"],considerations:["Best with controlled background","Consider when transparent vs opaque mode"] },

  // OUTPUT / FEEDBACK (blue)
  { id:"light",cat:"feedback",name:"Light",sub:"Feedback",img:"output_light.png",desc:"LED indicators — single color, RGB, or addressable strips.",pros:["Low power","Instant","Visible at distance"],cons:["Limited information density","Can be missed"],considerations:["Color meaning must be learned or universal","Consider color-blind accessibility","Breathing/pulsing patterns add meaning"] },
  { id:"vibration",cat:"feedback",name:"Vibration",sub:"Feedback",img:"output_vibration.png",desc:"Haptic vibration — ERM, LRA, or piezo actuators.",pros:["Private/personal","Works when eyes busy","Tactile confirmation"],cons:["Power draw","Noise","Limited vocabulary"],considerations:["LRA for precise patterns, ERM for simple buzz","Vibration patterns need learning","Consider body location for perception"] },
  { id:"sound",cat:"feedback",name:"Sound",sub:"Feedback",img:"output_sound.png",desc:"Audio output — beeps, tones, speech, or spatial audio.",pros:["Rich information","Attention-grabbing","Language possible"],cons:["Disturbs others","Ambient noise masking"],considerations:["Consider bone conduction for private audio","Spatial audio requires multiple speakers","Earcon design: short, distinct, meaningful"] },
  { id:"temperature",cat:"feedback",name:"Temperature",sub:"Feedback",img:"output_temperature.png",desc:"Thermal feedback — Peltier elements for hot/cold sensation.",pros:["Unique modality","Emotional associations"],cons:["Slow response","Power intensive","Safety risk"],considerations:["Temperature range 18-42°C safe zone","Warm = positive, cool = alert is intuitive","Requires skin contact"] },
  { id:"pressure",cat:"feedback",name:"Pressure",sub:"Feedback",img:"output_pressure.png",desc:"Mechanical pressure output — inflatable, pneumatic, or squeeze.",pros:["Strong physical sensation","Calming potential"],cons:["Mechanical complexity","Slow"],considerations:["Blood pressure cuff-style actuation","Consider compression garments for wearables"] },
  { id:"texture",cat:"feedback",name:"Texture",sub:"Feedback",img:"output_texture.png",desc:"Surface texture change — shape memory, electroactive polymers.",pros:["Tactile information without looking"],cons:["Exotic materials","Slow actuation","Expensive"],considerations:["Braille-style pin arrays for information","Consider electrotactile as lighter alternative"] },
  { id:"geometrychange",cat:"feedback",name:"Geometry Change",sub:"Feedback",img:"output_geometrychange.png",desc:"Physical shape transformation — morphing surfaces, deployable structures.",pros:["Dramatic, attention-getting","Physical information"],cons:["Mechanically complex","Reliability challenges"],considerations:["Shape memory alloys for small scale","Consider servo-driven mechanisms for larger transformations"] },
  { id:"information",cat:"feedback",name:"Information",sub:"Feedback",img:"output_information.png",desc:"Content display — text, images, video, data visualization.",pros:["Rich semantic content","Flexible"],cons:["Requires display","Visual attention needed"],considerations:["Match information density to glance duration","Consider progressive disclosure"] },

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
};

// ── CATEGORY DEFINITIONS ──────────────────────────────────────
const CATEGORIES = {
  scenario: { label:"Scenario", color:"#F4ADCB", group:"context" },
  gesture:  { label:"Gesture",  color:"#FFBE7A", group:"input" },
  control:  { label:"Control",  color:"#FF8C69", group:"input" },
  sensor:   { label:"Sensor",   color:"#C4ADFF", group:"input" },
  camera:   { label:"Camera",   color:"#7BAAFF", group:"input" },
  display:  { label:"Display",  color:"#5BC8FF", group:"output" },
  feedback: { label:"Feedback", color:"#5BEFEF", group:"output" },
  connect:  { label:"Connect",  color:"#5BE8A4", group:"enable" },
  port:     { label:"Port",     color:"#3DCC80", group:"enable" },
  charging: { label:"Charging", color:"#FFD040", group:"enable" },
  cooling:  { label:"Cooling",  color:"#80B8D4", group:"enable" },
  platform: { label:"Platform", color:"#C8FF00", group:"enable" },
};

const GROUPS = {
  context: { label:"SCENARIO", color:"#F4ADCB" },
  input:   { label:"INPUT",    color:"#FFBE7A" },
  output:  { label:"OUTPUT",   color:"#5BC8FF" },
  enable:  { label:"ENABLE",   color:"#5BE8A4" },
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
  const bg = "#0B0B0B";
  const surface = "#151515";
  const surfaceLight = "#1E1E1E";
  const border = "#2A2A2A";
  const text = "#E8E6E1";
  const textDim = "#888";
  const lime = "#C8FF00";

  const s = {
    root: { fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:bg, color:text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
    mono: { fontFamily:"'IBM Plex Mono',monospace" },
    nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:`1px solid ${border}`, background:surface },
    logo: { fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:700, letterSpacing:"0.2em", color:lime },
    navLinks: { display:"flex", gap:4 },
    navBtn: (active) => ({ padding:"8px 16px", borderRadius:6, border:"none", background:active?lime:"transparent", color:active?bg:textDim, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.03em", transition:"all 0.15s" }),
    sidebar: { width:220, borderRight:`1px solid ${border}`, padding:"16px 0", overflowY:"auto", flexShrink:0 },
    catBtn: (active) => ({ width:"100%", padding:"10px 20px", border:"none", background:active?surfaceLight:"transparent", color:active?text:textDim, fontSize:13, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'IBM Plex Sans',sans-serif", transition:"all 0.1s" }),
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, padding:20, alignItems:"start" },
    card: (sel) => ({ background:sel?surfaceLight:surface, border:`1px solid ${sel?lime:border}`, borderRadius:10, padding:16, cursor:"pointer", transition:"all 0.15s", position:"relative" }),
    tag: (color) => ({ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, background:color+"22", color, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em" }),
    badge: { position:"absolute", top:10, right:10, width:10, height:10, borderRadius:"50%", background:lime },
    panel: { background:surface, border:`1px solid ${border}`, borderRadius:10, padding:20, marginBottom:16 },
    btnPrimary: { padding:"10px 20px", borderRadius:8, border:"none", background:lime, color:bg, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" },
    btnSecondary: { padding:"10px 20px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" },
    selTray: { position:"fixed", bottom:0, left:0, right:0, background:surface, borderTop:`1px solid ${border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:100 },
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
