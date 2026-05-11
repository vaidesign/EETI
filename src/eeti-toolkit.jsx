import { useState, useMemo, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// EETI TOOLKIT v4 — Canvas + Consequence Engine
// ═══════════════════════════════════════════════════════════════

const CARDS = [
  // SCENARIO
  { id:"standing",cat:"scenario",name:"Standing",sub:"Context",img:"scenario_standing.png",desc:"User is upright, hands potentially free. Favors glanceable outputs and quick gestural inputs.",pros:["Hands free for interaction","Natural for wearables"],cons:["Limited attention span","Movement introduces noise"],considerations:["Keep interactions brief","Prefer haptic/audio over visual for alerts"],implication:"Your product has half a second and one glance. If it can't communicate its state in that window, it's failing every time the user looks at it." },
  { id:"sitting",cat:"scenario",name:"Sitting",sub:"Context",img:"scenario_sitting.png",desc:"User is seated — at a desk, in transit, or relaxing. Allows longer engagement and finer motor control.",pros:["Extended interaction possible","Stable hand position"],cons:["May compete with other seated tasks"],considerations:["Can support more complex inputs","Consider ergonomic reach zones"],implication:"Extended dwell time means richer interaction is possible — but also that every friction point accumulates. Small annoyances that pass in a standing moment linger here." },
  { id:"indoor",cat:"scenario",name:"Indoor",sub:"Context",img:"scenario_indoor.png",desc:"Controlled environment with predictable lighting, temperature, and connectivity.",pros:["Reliable WiFi/power access","Controlled ambient conditions"],cons:["Less need for ruggedization"],considerations:["Can use ambient sensors effectively","Power outlets likely available"],implication:"Reliable WiFi and power means you can offload constraint-driven choices. The design freedom this gives is also a trap — more capability than the use case needs." },
  { id:"outdoor",cat:"scenario",name:"Outdoor",sub:"Context",img:"scenario_outdoor.png",desc:"Variable conditions — weather, lighting, noise. Demands robustness and visibility.",pros:["GPS meaningful","Solar power viable"],cons:["Screen glare","Environmental interference","Moisture/dust risk"],considerations:["Weatherproofing required","High-contrast displays preferred","Consider glove compatibility"],implication:"Every output you design for indoor legibility is wrong here. Glare, cold fingers, wet hands, ambient noise — the environment is adversarial unless you design for it explicitly." },
  { id:"mobile",cat:"scenario",name:"Mobile",sub:"Context",img:"scenario_mobile.png",desc:"User is in motion — walking, cycling, commuting. Attention is divided.",pros:["Captures real-time movement data"],cons:["Vibration/movement noise","Split attention"],considerations:["Minimize visual dependency","Favor haptic + audio feedback","One-hand or no-hand operation"],implication:"Attention is divided, motion adds noise, one hand may be occupied. Every interaction that requires two hands or sustained focus is an interaction that won't be completed." },
  { id:"stationary",cat:"scenario",name:"Stationary",sub:"Context",img:"scenario_stationary.png",desc:"Fixed installation — kiosk, wall-mounted, or embedded in furniture/architecture.",pros:["No battery constraints","Can be larger","Stable mounting"],cons:["Limited to one location"],considerations:["Can use wired power/network","Consider viewing distance","Public vs private context"],implication:"The product owns its location — that's a constraint and a freedom. It can be larger, wired, and more capable. It can also be ignored entirely if it doesn't earn its place." },
  { id:"wearable",cat:"scenario",name:"Wearable",sub:"Media",img:"scenario_wearble.png",desc:"Worn on body — wrist, head, torso, finger. Always-on, always-with-you.",pros:["Continuous sensing","Personal/private"],cons:["Size severely constrained","Comfort critical","Battery limited"],considerations:["Minimize weight","Skin contact enables biometrics","Social acceptability matters"],implication:"The body is the form factor brief. Weight, comfort, social visibility, and skin contact aren't secondary concerns — they are the primary engineering brief." },
  { id:"vehicle",cat:"scenario",name:"Vehicle",sub:"Media",img:"scenario_vehicle.png",desc:"In-car, bicycle, or other vehicle context. Safety-critical, eyes-busy.",pros:["12V power available","GPS meaningful"],cons:["Driver distraction risk","Vibration"],considerations:["Voice/haptic over visual","Large simple controls","Hands-free operation essential"],implication:"The driver cannot look. Not 'prefers not to' — legally and safely cannot. Every visual output you add is either redundant with a glance or a safety liability." },
  { id:"social",cat:"scenario",name:"Social",sub:"Context",img:"scenario_social.png",desc:"Multi-person setting — meeting, party, public space. Privacy and discretion matter.",pros:["Shared experiences possible"],cons:["Privacy concerns","Noise interference","Social judgment"],considerations:["Discreet interactions preferred","Consider bystander experience","Audio output may disturb others"],implication:"Every bystander is an unintended user. Sounds, lights, and screen contents that seem private in testing become social broadcasts in the real context." },
  { id:"individual",cat:"scenario",name:"Individual",sub:"Context",img:"scenario_individual.png",desc:"Solo use — personal device, private moment. Full attention possible.",pros:["Full user attention","No privacy constraints"],cons:["No shared interaction"],considerations:["Can use any output modality","Personal data OK","Richer interaction possible"],implication:"Full attention and no social constraint — the richest possible interaction context. The risk is over-designing for this ideal state and failing in every other." },
  { id:"phone",cat:"scenario",name:"Smart Phone",sub:"Media",img:"scenario_phone.png",desc:"Companion device or phone-connected experience. Leverages phone's capabilities.",pros:["Rich display via phone","Phone handles connectivity"],cons:["Dependency on phone","Pairing complexity"],considerations:["BLE likely needed","Consider phone as hub","App companion design"],implication:"Your device borrows the phone's display, connectivity, and processing — and inherits its dependency. Every time pairing breaks, the product breaks with it." },

  // GESTURE
  { id:"tap",cat:"gesture",name:"Tap",sub:"Gesture",img:"input_tap.png",desc:"Single touch contact. The most basic and universal interaction.",pros:["Universally understood","Fast","Low error rate"],cons:["Limited expressiveness","Requires touch surface"],considerations:["Needs feedback confirmation","Consider touch target size >44px equivalent"],implication:"The default assumption — users arrive expecting it to work. If it doesn't, or if targets are too small, you've broken the implicit contract before the experience begins." },
  { id:"doubletap",cat:"gesture",name:"Double Tap",sub:"Gesture",img:"input_doubletap.png",desc:"Two rapid touches. Adds a second layer of meaning to the same surface.",pros:["Extends tap vocabulary"],cons:["Timing-sensitive","Delays single-tap response"],considerations:["Needs clear timing window","Not discoverable without instruction"],implication:"Borrows speed from single-tap by making it wait. Every double-tap feature introduces a hesitation in the single-tap path — decide if the trade is worth it." },
  { id:"press",cat:"gesture",name:"Press",sub:"Gesture",img:"input_press.png",desc:"Sustained contact. Duration creates a distinct meaning from tap.",pros:["Distinct from tap","Can trigger progressive actions"],cons:["Slower","Ambiguous threshold"],considerations:["Need visual/haptic feedback for threshold","Consider press-and-hold duration"],implication:"Creates a threshold the user cannot see. You'll need feedback to make the moment of commitment feel intentional rather than accidental." },
  { id:"drag",cat:"gesture",name:"Drag",sub:"Gesture",img:"input_drag.png",desc:"Touch and move. Maps well to spatial manipulation.",pros:["Intuitive for positioning","Continuous control"],cons:["Requires screen/surface","Occlusion by finger"],considerations:["Need clear drag handles","Consider momentum/inertia"],implication:"The user's finger hides exactly what they're trying to position. You're designing for an interaction where the tool occludes the work." },
  { id:"tilt",cat:"gesture",name:"Tilt",sub:"Gesture",img:"input_tilt.png",desc:"Device or body angle change. Uses accelerometer data.",pros:["Hands-free possible","Natural motion"],cons:["Accidental triggering","Requires accelerometer"],considerations:["Needs dead zones to prevent false triggers","Calibration may be needed"],implication:"Turns the whole device into the input — any unintentional movement becomes a command. Dead zones aren't optional; they define the difference between responsive and maddening." },
  { id:"rotate",cat:"gesture",name:"Rotate",sub:"Gesture",img:"input_rotate.png",desc:"Twisting motion — like turning a dial or rotating the wrist.",pros:["Natural for value adjustment","Continuous range"],cons:["Hard on flat screens","Needs gyroscope"],considerations:["Map rotation direction to value direction intuitively","Consider detent/snap points"],implication:"The most natural gesture for value adjustment, but requires a surface or gyroscope to detect reliably. Without detent points, users have no anchor for 'how much'." },
  { id:"multitouch",cat:"gesture",name:"Multi Touch",sub:"Gesture",img:"input_multitouch.png",desc:"Two or more simultaneous contact points. Enables pinch, zoom, rotate on surface.",pros:["Rich interaction vocabulary"],cons:["Requires multitouch surface","Not always discoverable"],considerations:["Pinch-to-zoom is expected","Consider three-finger gestures carefully"],implication:"Unlocks a richer vocabulary but makes discoverability impossible — nobody tries a three-finger swipe without being told. Every multi-touch gesture needs a surface for teaching it." },
  { id:"pitch",cat:"gesture",name:"Pitch",sub:"Gesture",img:"input_pitch.png",desc:"Two-finger spread/pinch. Primarily for scaling content.",pros:["Standard for zoom","Intuitive scaling"],cons:["Requires multitouch"],considerations:["Maintain center point during zoom","Set min/max bounds"],implication:"Scale is the expectation; surprise it and users feel disoriented. The moment pinch doesn't scale something, the gesture has become a liability." },
  { id:"shake",cat:"gesture",name:"Shake",sub:"Gesture",img:"input_shake.png",desc:"Rapid back-and-forth motion. Often used for undo or reset.",pros:["Dramatic, memorable","No surface needed"],cons:["Accidental trigger risk","Requires accelerometer"],considerations:["High threshold to avoid false positives","Provide undo for the undo"],implication:"Dramatic enough to feel like a reset, fragile enough to trigger on the bus. The threshold you set defines whether users trust it or fear it." },
  { id:"push",cat:"gesture",name:"Push",sub:"Gesture",img:"input_push.png",desc:"Force applied away from user. Physical, embodied interaction.",pros:["Satisfying physical feedback"],cons:["Needs mechanical design"],considerations:["Spring return or latching?","Force feedback important"],implication:"Physical force implies permanence — users expect a push to commit something. If it's reversible, that needs to be clear before contact." },
  { id:"pull",cat:"gesture",name:"Pull",sub:"Gesture",img:"input_pull.png",desc:"Force applied toward user. Paired with push for bidirectional control.",pros:["Intuitive for retrieval/activation"],cons:["Mechanical complexity"],considerations:["Consider cord/handle ergonomics","Resistance profile matters"],implication:"The resistance profile is the experience — a cord with the wrong tension feels cheap or dangerous regardless of what it triggers." },
  { id:"lift",cat:"gesture",name:"Lift",sub:"Gesture",img:"input_lift.png",desc:"Picking up or raising an object. Triggers on removal from surface.",pros:["Natural wake trigger","Weight-based detection possible"],cons:["Needs weight/proximity sensor"],considerations:["Combine with accelerometer for lift detection","Consider put-down as paired action"],implication:"Turns an object's absence into an event. Your product now needs to know when it's been picked up — and decide what 'picked up' means versus 'moved'." },
  { id:"drop",cat:"gesture",name:"Drop",sub:"Gesture",img:"input_drop.png",desc:"Releasing an object to fall. Can trigger on impact or release.",pros:["Dramatic gesture","Clear intention"],cons:["Risk of damage","Needs impact detection"],considerations:["Protect hardware from drops","Consider soft vs hard landing detection"],implication:"Requires the user to trust the hardware enough to drop it. If it survives, that's reassuring; if the casing cracks, the interaction model is permanently broken." },
  { id:"hover",cat:"gesture",name:"Hover",sub:"Gesture",img:"input_hover.png",desc:"Proximity without contact. Hand or finger detected above surface.",pros:["Contactless interaction","Preview before commit"],cons:["Needs proximity sensor","Less precise"],considerations:["Useful for hygiene-sensitive contexts","Define hover-to-select transition clearly"],implication:"Offers a preview state between approach and commitment. But the device must always be listening, which has power and privacy costs." },

  // CONTROL
  { id:"button",cat:"control",name:"Button",sub:"Control",img:"input_button.png",desc:"Physical momentary switch. Discrete on/off with tactile feedback.",pros:["Clear tactile feedback","Zero ambiguity","Works with gloves"],cons:["Limited to binary states","Takes physical space"],considerations:["Debouncing needed in firmware","Consider button travel distance and click force"],implication:"The clearest affordance in physical interaction — but it only ever says yes or no. Every additional state you need requires another button or a mode the user can't see." },
  { id:"jogwheel",cat:"control",name:"Jog Wheel",sub:"Control",img:"input_jogwheel.png",desc:"Rotary encoder. Endless rotation for scrolling, value adjustment.",pros:["Precise incremental control","Infinite range"],cons:["Requires mechanical space"],considerations:["Detented vs smooth rotation","Click-to-confirm adds utility"],implication:"Infinite rotation maps naturally to scrolling and value adjustment, but the detent profile is the experience — a cheap encoder with wrong detents reads as a cheap product." },
  { id:"toggleswitch",cat:"control",name:"Toggle Switch",sub:"Control",img:"input_toggleswitch.png",desc:"Physical two-state switch. Position communicates current state.",pros:["State visible at a glance","Satisfying physical feel"],cons:["Binary only","Takes space"],considerations:["Position should map to on/off intuitively","Consider switch guard for critical functions"],implication:"Position is state — the user can check it without interacting with it. That's rare and valuable. Don't put a toggle where a button's reversibility would be safer." },
  { id:"slider",cat:"control",name:"Slider",sub:"Control",img:"input_slider.png",desc:"Linear track with movable thumb. Maps position to value.",pros:["Visual position = value","Continuous range"],cons:["Takes linear space","Dust/moisture vulnerable"],considerations:["Consider detent positions","Motorized sliders can provide feedback"],implication:"Physical position equals value — immediate, readable, satisfying. But sliders accumulate dust, wear, and moisture vulnerability in ways that buttons don't." },
  { id:"joystick",cat:"control",name:"Joystick",sub:"Control",img:"input_joystick.png",desc:"Multi-axis analog stick. X/Y positioning with optional Z-click.",pros:["2D control in one input","Intuitive directional"],cons:["Mechanical complexity","Drift over time"],considerations:["Dead zone calibration essential","Spring return vs position hold"],implication:"Two axes of control in one input, but drift is the long-term failure mode. Any joystick-dependent control path becomes unreliable after months of use without recalibration." },
  { id:"keyboard",cat:"control",name:"Keyboard",sub:"Control",img:"input_keyboard.png",desc:"Array of labeled keys. Full text input capability.",pros:["Rich text input","Familiar"],cons:["Large footprint","Complex electronics"],considerations:["Membrane vs mechanical","Consider reduced key layouts for embedded"],implication:"Full text input capability at the cost of everything else — footprint, sealing, one-handed use, glove compatibility. Justify it hard before adding it." },
  { id:"mouse",cat:"control",name:"Mouse",sub:"Control",img:"input_mouse.png",desc:"Pointing device with buttons. Desktop-paradigm interaction.",pros:["Precise cursor control","Familiar"],cons:["Requires flat surface","Not mobile-friendly"],considerations:["Optical vs trackball inside","DPI settings matter"],implication:"A desktop paradigm that travels badly — requires a flat surface, both hands free, and a seated posture. Outside of that envelope, it's the wrong tool." },
  { id:"trackball",cat:"control",name:"Track Ball",sub:"Control",img:"input_trackball.png",desc:"Stationary ball for cursor control. No surface movement needed.",pros:["Works in tight spaces","No surface needed"],cons:["Less intuitive than mouse"],considerations:["Ball size affects precision","Consider thumb vs finger operation"],implication:"The mouse's answer to tight spaces — more ergonomic for extended use, but harder to learn and rarely discovered intuitively by new users." },
  { id:"stylus",cat:"control",name:"Stylus",sub:"Control",img:"input_stylus.png",desc:"Pen-like input tool. Pressure sensitivity, tilt, precise positioning.",pros:["High precision","Natural for drawing"],cons:["Easy to lose","Requires compatible surface"],considerations:["Active vs passive stylus","Pressure levels matter for creative use"],implication:"High precision and natural for drawing, but the moment a user puts it down, the interaction model changes. Every stylus-dependent feature needs a touch fallback." },
  { id:"touchpad",cat:"control",name:"Touch Pad",sub:"Control",img:"input_touchpad.png",desc:"Flat capacitive surface. Gesture recognition without moving parts.",pros:["No mechanical wear","Supports gestures","Sealed surface"],cons:["No tactile feedback","Precision varies"],considerations:["Size determines gesture complexity","Consider haptic feedback addition"],implication:"No moving parts, sealed surface — mechanically robust. But without tactile feedback, users can't feel whether their gesture registered. Add haptics or accept uncertainty." },
  { id:"lever",cat:"control",name:"Lever",sub:"Control",img:"input_lever.png",desc:"Pivoting arm. Large mechanical range for analog control.",pros:["High force input possible","Very tactile"],cons:["Large mechanical space","Single axis"],considerations:["Spring return or detented positions","Consider leverage ratio"],implication:"High-force input with a satisfying physical range. The lever's resistance profile communicates authority — a floppy lever feels dangerous, a stiff one feels broken." },
  { id:"remotecontrol",cat:"control",name:"Remote Control",sub:"Control",img:"input_remote_control.png",desc:"Wireless handheld controller. Operates device from distance.",pros:["Distance operation","Familiar paradigm"],cons:["Losable","Needs own power"],considerations:["IR vs RF vs BLE","Button layout ergonomics critical"],implication:"Adds a second device to the system — with its own battery, its own loss risk, its own pairing complexity. Each of those is a support call waiting to happen." },
  { id:"beacon",cat:"control",name:"Smart Beacon",sub:"Control",img:"input_beacon.png",desc:"Proximity-triggered BLE broadcaster. Location-aware interactions.",pros:["Passive triggering","Location context"],cons:["Needs receiving device","Battery replacement"],considerations:["Range calibration important","Consider beacon density for accuracy"],implication:"Passive and invisible — users don't interact with it, they just arrive in its range. That invisibility is its power and its limitation: no recovery when detection fails." },

  // SENSOR
  { id:"airsensor",cat:"sensor",name:"Air Sensor",sub:"Sensor",img:"input_airsensor.png",desc:"Measures air quality — particulates, VOCs, pollutants.",pros:["Health-relevant data","Growing demand"],cons:["Calibration drift","Sensor aging"],considerations:["Needs airflow access — don't seal it","Warm-up time before accurate readings"],implication:"Requires continuous airflow access — any sealed enclosure kills it. The sensor's location in the product is not a secondary decision; it constrains the entire enclosure design." },
  { id:"infrared",cat:"sensor",name:"Infrared Sensor",sub:"Sensor",img:"input_infraresdsensor.png",desc:"Detects IR radiation — heat signatures, remote signals, proximity.",pros:["Works in darkness","Non-contact"],cons:["Line-of-sight only","Ambient IR interference"],considerations:["Consider active vs passive IR","Lens design affects field of view"],implication:"Line-of-sight only means the user's body and any intervening objects become part of the sensor design. Occlusion isn't an edge case — it's the most common failure mode." },
  { id:"distance",cat:"sensor",name:"Distance Sensor",sub:"Sensor",img:"input_distancesensor.png",desc:"Measures distance to objects — ultrasonic, ToF, or IR ranging.",pros:["Non-contact measurement","Fast response"],cons:["Surface material affects accuracy","Limited range"],considerations:["ToF for precision, ultrasonic for range","Consider beam angle for detection zone"],implication:"The beam angle determines the detection zone, and the detection zone IS the interaction space. This is an optics decision as much as a sensor choice." },
  { id:"tempsensor",cat:"sensor",name:"Temperature Sensor",sub:"Sensor",img:"input_temperaruresensor.png",desc:"Measures ambient or contact temperature.",pros:["Simple, reliable","Low power"],cons:["Slow response to rapid changes","Self-heating errors"],considerations:["Thermistor vs thermocouple vs digital","Placement affects accuracy — avoid heat sources"],implication:"Self-heating from nearby components corrupts readings in ways that are invisible during testing and embarrassing at deployment. Placement is calibration." },
  { id:"vibsensor",cat:"sensor",name:"Vibration Sensor",sub:"Sensor",img:"input_vibrationsensor.png",desc:"Detects mechanical vibration — piezo or accelerometer-based.",pros:["Detects machine health","Tamper detection"],cons:["Needs mounting contact","Noise filtering required"],considerations:["Sample rate determines frequency detection","Consider FFT analysis for patterns"],implication:"Detects what it's mounted to — which means its mounting is as important as its sensitivity. A loose mount turns structural vibration into noise and machine faults into silence." },
  { id:"locationsensor",cat:"sensor",name:"Location Sensor",sub:"Sensor",img:"input_locationsensor.png",desc:"Determines geographic position — GPS, GLONASS, triangulation.",pros:["Absolute positioning","Outdoor navigation"],cons:["No indoor coverage","Power hungry","Slow first fix"],considerations:["Combine with accelerometer for dead reckoning","A-GPS reduces fix time"],implication:"Outdoor accuracy, indoor nothing. If the use case crosses that boundary — a product used in a car and at home — you're designing for two incompatible location models." },
  { id:"lightsensor",cat:"sensor",name:"Light Sensor",sub:"Sensor",img:"input_lightsensor.png",desc:"Measures ambient light levels — LDR, photodiode, or lux sensor.",pros:["Low power","Simple","Auto-brightness"],cons:["Spectral response varies"],considerations:["Placement critical — avoid shadowing","Consider UV/IR filtering needs"],implication:"Placement determines accuracy — shadow it with a component or an enclosure seam and auto-brightness becomes random. It needs a clear view of what it's measuring." },
  { id:"colorsensor",cat:"sensor",name:"Color Sensor",sub:"Sensor",img:"input_colorsensor.png",desc:"Detects color of surfaces or light — RGB or spectral analysis.",pros:["Material identification","Sorting applications"],cons:["Needs controlled lighting","Close range"],considerations:["White LED illumination needed for surfaces","Calibrate against known references"],implication:"Requires controlled illumination — ambient light variation corrupts readings. The white LED that illuminates the surface is as much the sensor as the detector is." },
  { id:"motionsensor",cat:"sensor",name:"Motion Sensor",sub:"Sensor",img:"input_motionsensor.png",desc:"Detects movement — PIR, radar, or accelerometer-based.",pros:["Low power wake trigger","Wide detection area"],cons:["Cannot identify who/what","False triggers from heat sources"],considerations:["PIR for presence, accelerometer for device motion","Fresnel lens design shapes detection zone"],implication:"Detects movement, not identity. A dog, a curtain, and a person all look the same. Every motion-triggered behavior needs a failure mode that a false positive won't ruin." },
  { id:"healthsensor",cat:"sensor",name:"Health Sensor",sub:"Sensor",img:"input_healthsensor.png",desc:"Biometric measurement — heart rate, SpO2, skin conductance, temperature.",pros:["Personal health data","Continuous monitoring"],cons:["Skin contact required","Motion artifacts"],considerations:["Green LED PPG for heart rate","Ensure proper skin contact pressure","Medical vs wellness accuracy requirements"],implication:"Requires sustained, consistent skin contact — the interface between sensor and body is the product's most critical mechanical detail, not the sensor itself." },
  { id:"weightsensor",cat:"sensor",name:"Weight Sensor",sub:"Sensor",img:"input_weightsensor.png",desc:"Measures force/weight — load cells, strain gauges, FSRs.",pros:["Simple, reliable","Analog sensing"],cons:["Calibration needed","Temperature sensitive"],considerations:["Load cell for precision, FSR for detect-only","Consider overload protection"],implication:"Load cells measure what's placed on them, not what's intended. Overload protection is not optional — one event beyond range destroys calibration permanently." },
  { id:"energysensor",cat:"sensor",name:"Energy Sensor",sub:"Sensor",img:"input_energysensor.png",desc:"Monitors power consumption — current sensing, voltage monitoring.",pros:["System health data","Power optimization"],cons:["Additional circuit complexity"],considerations:["Hall effect for non-invasive current sensing","Consider power factor for AC"],implication:"The sensor that reveals whether your other design decisions were right. Adding it late means discovering power budget problems after the enclosure is tooled." },
  { id:"soundsensor",cat:"sensor",name:"Sound Sensor",sub:"Sensor",img:"input_soundsensor.png",desc:"Captures audio — MEMS microphone, electret, or piezo.",pros:["Voice commands","Environmental monitoring"],cons:["Privacy concerns","Noise filtering needed"],considerations:["MEMS mics are tiny and cheap","Consider array for directionality","Always-listening vs wake-word"],implication:"Always-listening raises a privacy question the user didn't know they were answering when they bought the product. That question needs to be surfaced in the design, not buried in the manual." },
  { id:"humidity",cat:"sensor",name:"Humidity Sensor",sub:"Sensor",img:"input_humiditysensor.png",desc:"Measures relative humidity — capacitive or resistive.",pros:["Low cost","Important for comfort/agriculture"],cons:["Slow response","Contamination risk"],considerations:["Often combined with temperature sensor","Avoid direct water contact"],implication:"Contamination from condensation or cleaning products degrades it silently over months. Plan for replacement, not just calibration." },
  { id:"gassensor",cat:"sensor",name:"Gas Sensor",sub:"Sensor",img:"input_gassensor.png",desc:"Detects specific gases — CO2, CO, methane, VOCs.",pros:["Safety critical","Environmental monitoring"],cons:["Power hungry","Cross-sensitivity","Warm-up time"],considerations:["Electrochemical for precision, MOS for broad detection","Requires airflow access"],implication:"Warm-up time before accurate readings means the first minutes of operation are unreliable. Any alert system built on this sensor needs to account for that window." },
  { id:"watersensor",cat:"sensor",name:"Water Property",sub:"Sensor",img:"input_waterpropertysensor.png",desc:"Measures water characteristics — pH, TDS, turbidity, conductivity.",pros:["Water quality monitoring"],cons:["Probe maintenance","Calibration critical"],considerations:["Electrodes degrade — plan for replacement","Isolate electronics from water exposure"],implication:"The probes that touch water degrade — they're not a sensor, they're a consumable. Every product with this sensor has a maintenance model, whether designed or not." },

  // CAMERA
  { id:"codetracking",cat:"camera",name:"Code Tracking",sub:"Camera",img:"input_codetracking.png",desc:"Barcode/QR scanning via camera. Links physical to digital.",pros:["Low cost","Rich data encoding"],cons:["Needs camera + processing","Lighting dependent"],considerations:["QR codes are more robust than barcodes","Consider autofocus speed for scanning UX"],implication:"Links physical objects to digital content — but the scan moment is a friction point. If lighting is poor or autofocus is slow, users give up and the physical/digital link breaks." },
  { id:"gazetracking",cat:"camera",name:"Gaze Tracking",sub:"Camera",img:"input_gazetracking.png",desc:"Eye tracking via IR cameras. Knows where the user is looking.",pros:["Hands-free input","Attention awareness"],cons:["Expensive","Calibration per user","Privacy concerns"],considerations:["Near-IR illumination needed","Consider glasses/contacts compatibility"],implication:"Knows where the user is looking — which is close to knowing what they're thinking. That capability brings a privacy expectation the product must be transparent about." },
  { id:"headtracking",cat:"camera",name:"Head Tracking",sub:"Camera",img:"input_headtracking.png",desc:"Tracks head position and rotation. Nod, shake, look-direction.",pros:["Hands-free control","Natural gestures"],cons:["Camera or IMU required","Limited vocabulary"],considerations:["Nod/shake for yes/no is cross-cultural","Combine with gaze for rich interaction"],implication:"Nod for yes, shake for no — deeply cross-cultural, minimal learning curve. But the gesture vocabulary stops there; more than 3–4 head gestures and users stop discovering them." },
  { id:"motiontracking",cat:"camera",name:"Motion Tracking",sub:"Camera",img:"input_motiontracking.png",desc:"Full body or limb tracking via camera or IMU array.",pros:["Rich spatial data","Activity recognition"],cons:["Processing intensive","Privacy concerns"],considerations:["Depth cameras improve accuracy","Edge processing for privacy"],implication:"Rich spatial data at the cost of significant processing — which means heat, battery draw, and latency. Every motion-tracked interaction has a power budget attached." },
  { id:"handtracking",cat:"camera",name:"Hand Tracking",sub:"Camera",img:"input_handtracking.png",desc:"Tracks hand position, finger pose, and gestures in 3D space.",pros:["Natural gestural input","No wearable needed"],cons:["Occlusion issues","Processing heavy"],considerations:["Depth sensor improves robustness","Define clear gesture vocabulary to avoid confusion"],implication:"No wearable required — but occlusion is constant and the gesture vocabulary is undefined. Users will invent gestures the system wasn't trained to recognize." },
  { id:"fingerprint",cat:"camera",name:"Finger Print",sub:"Camera",img:"input_fingerprint.png",desc:"Biometric identification via fingerprint scanning.",pros:["Secure authentication","Fast","Personal"],cons:["Wet/dirty fingers fail","Spoofing risk"],considerations:["Capacitive vs optical vs ultrasonic","Consider fallback authentication method"],implication:"Authentication that's invisible when it works and total friction when it doesn't. Wet fingers, cuts, and gloves are not edge cases — plan the fallback before the primary path." },

  // DISPLAY
  { id:"lcd",cat:"display",name:"LCD/LED Screen",sub:"Display",img:"output_lcdledscreen.png",desc:"Full-color active display. Rich visual output with backlighting.",pros:["Full color","Dynamic content","High brightness"],cons:["Power hungry","Fragile","Glare"],considerations:["Size vs resolution tradeoff","Consider sunlight readability","Touch integration adds cost"],implication:"Full color, dynamic content — but power-hungry and fragile. Every LCD is also a heat source and a glare problem waiting for the wrong lighting condition." },
  { id:"eink",cat:"display",name:"E-ink Screen",sub:"Display",img:"output_einkscreen.png",desc:"Bistable display — holds image without power. Paper-like readability.",pros:["Ultra low power","Excellent readability","No backlight glare"],cons:["Slow refresh","Limited/no color","No video"],considerations:["Perfect for status displays","Partial refresh for faster updates","Deep black levels, high contrast"],implication:"Holds its image without power — which means what the user sees when the battery dies is the last thing you displayed. Design the low-power state as deliberately as the active state." },
  { id:"segment",cat:"display",name:"Segment Screen",sub:"Display",img:"output_segementscreen.png",desc:"Seven-segment or custom segment display. Numbers and simple icons.",pros:["Very low power","High visibility","Simple driver"],cons:["Limited character set","No graphics"],considerations:["LED segments for brightness, LCD for power saving","Custom segments can show icons"],implication:"Seven segments can show numbers and basic characters — nothing more. That constraint forces communication discipline: if you can't say it in digits, you need a different output." },
  { id:"flexscreen",cat:"display",name:"Flexible Screen",sub:"Display",img:"output_flexiblescreen.png",desc:"Bendable OLED or e-paper. Conforms to curved surfaces.",pros:["Curved/organic form factors","Thin, lightweight"],cons:["Expensive","Limited sizes","Durability concerns"],considerations:["Consider bend radius limits","Connector design for flex zone"],implication:"The form factor freedom is real, but the connector at the flex zone is the failure point. Every bend radius the ID specifies is a reliability decision." },
  { id:"transparentscreen",cat:"display",name:"Transparent Screen",sub:"Display",img:"output_trasparentscreen.png",desc:"See-through display. Overlays digital on physical world.",pros:["Augmented reality without headset","Preserves visual context"],cons:["Low contrast","Very expensive","Limited brightness"],considerations:["Best with controlled background","Consider when transparent vs opaque mode"],implication:"Preserves the physical world while overlaying digital — but low contrast means the overlay competes with everything behind it. Only works where you control the background." },

  // FEEDBACK
  { id:"light",cat:"feedback",name:"Light",sub:"Feedback",img:"output_light.png",desc:"LED indicators — single color, RGB, or addressable strips.",pros:["Low power","Instant","Visible at distance"],cons:["Limited information density","Can be missed"],considerations:["Color meaning must be learned or universal","Consider color-blind accessibility","Breathing/pulsing patterns add meaning"],implication:"You're designing for presence, not attention — a notification that works only when a user happens to be facing the right direction. The form factor placement decision is also the information architecture decision." },
  { id:"vibration",cat:"feedback",name:"Vibration",sub:"Feedback",img:"output_vibration.png",desc:"Haptic vibration — ERM, LRA, or piezo actuators.",pros:["Private/personal","Works when eyes busy","Tactile confirmation"],cons:["Power draw","Noise","Limited vocabulary"],considerations:["LRA for precise patterns, ERM for simple buzz","Vibration patterns need learning","Consider body location for perception"],implication:"Private and eyes-free, but you're authoring a vocabulary of patterns the user must remember. A single buzz carries no meaning until you've taught them what it means." },
  { id:"sound",cat:"feedback",name:"Sound",sub:"Feedback",img:"output_sound.png",desc:"Audio output — beeps, tones, speech, or spatial audio.",pros:["Rich information","Attention-grabbing","Language possible"],cons:["Disturbs others","Ambient noise masking"],considerations:["Consider bone conduction for private audio","Spatial audio requires multiple speakers","Earcon design: short, distinct, meaningful"],implication:"The most attention-grabbing output in your toolkit — and the one that costs the most social capital. Every alert is borrowed from the goodwill of everyone nearby." },
  { id:"temperature",cat:"feedback",name:"Temperature",sub:"Feedback",img:"output_temperature.png",desc:"Thermal feedback — Peltier elements for hot/cold sensation.",pros:["Unique modality","Emotional associations"],cons:["Slow response","Power intensive","Safety risk"],considerations:["Temperature range 18-42°C safe zone","Warm = positive, cool = alert is intuitive","Requires skin contact"],implication:"Requires sustained skin contact to work at all. The moment the product breaks that contact — loose band, pocket, sleeve — the feedback channel goes silent with no indication it's gone." },
  { id:"pressure",cat:"feedback",name:"Pressure",sub:"Feedback",img:"output_pressure.png",desc:"Mechanical pressure output — inflatable, pneumatic, or squeeze.",pros:["Strong physical sensation","Calming potential"],cons:["Mechanical complexity","Slow"],considerations:["Blood pressure cuff-style actuation","Consider compression garments for wearables"],implication:"You're touching the user without them initiating it. That requires earned trust and calibrated force: too much reads as restraint, too little as meaningless." },
  { id:"texture",cat:"feedback",name:"Texture",sub:"Feedback",img:"output_texture.png",desc:"Surface texture change — shape memory, electroactive polymers.",pros:["Tactile information without looking"],cons:["Exotic materials","Slow actuation","Expensive"],considerations:["Braille-style pin arrays for information","Consider electrotactile as lighter alternative"],implication:"Informs without demanding attention — hands learn it passively over time. But the channel only exists while a finger is on the surface; lift off and it disappears." },
  { id:"geometrychange",cat:"feedback",name:"Geometry Change",sub:"Feedback",img:"output_geometrychange.png",desc:"Physical shape transformation — morphing surfaces, deployable structures.",pros:["Dramatic, attention-getting","Physical information"],cons:["Mechanically complex","Reliability challenges"],considerations:["Shape memory alloys for small scale","Consider servo-driven mechanisms for larger transformations"],implication:"Unmissable and dramatic — commands attention regardless of context. But it announces something changed without saying what; you still need another channel for meaning." },
  { id:"information",cat:"feedback",name:"Information",sub:"Feedback",img:"output_information.png",desc:"Content display — text, images, video, data visualization.",pros:["Rich semantic content","Flexible"],cons:["Requires display","Visual attention needed"],considerations:["Match information density to glance duration","Consider progressive disclosure"],implication:"All your output richness is now contingent on the user looking. Every piece of information you show is competing with everything else visible in their environment." },

  // CONNECT
  { id:"bluetooth",cat:"connect",name:"Bluetooth",sub:"Connect",img:"enable_bluetooth.png",desc:"Short-range wireless. BLE for low power, Classic for audio/data.",pros:["Low power (BLE)","Universal phone support","Small chip footprint"],cons:["Short range ~10m","Pairing complexity","Metal housing blocks signal"],considerations:["BLE for sensors, Classic for audio","Cannot be fully encased in metal","User needs pairing interface","If long battery life needed, use BLE not Classic"],implication:"The moment you add BLE, you've added a first-use ritual: pairing. That two-minute setup experience shapes the user's first impression of the entire product." },
  { id:"wifi",cat:"connect",name:"WiFi",sub:"Connect",img:"enable_wifi.png",desc:"Standard wireless networking. High bandwidth, internet access.",pros:["High bandwidth","Internet access","Established infrastructure"],cons:["Power hungry","Needs access point","Security configuration"],considerations:["Consider WiFi Direct for peer-to-peer","Power consumption 10-50x of BLE","Needs antenna clearance from metal/body"],implication:"You've traded battery life for bandwidth. Unless you need continuous high-throughput data, every WiFi radio is a design decision that needs justifying in the power budget." },
  { id:"lora",cat:"connect",name:"LoRa",sub:"Connect",img:"enable_lora.png",desc:"Long-range, low-power radio. Ideal for IoT sensor networks.",pros:["Multi-kilometer range","Very low power","No infrastructure needed"],cons:["Very low bandwidth","High latency"],considerations:["Perfect for periodic sensor data","Not for real-time or audio/video","Consider LoRaWAN for managed networks"],implication:"Designed for data that can wait — sensor readings, status updates, not responses. If your use case needs acknowledgment within seconds, this isn't the right radio." },
  { id:"cellular",cat:"connect",name:"Cellular",sub:"Connect",img:"enable_cellular.png",desc:"Mobile network connectivity — 4G/5G/NB-IoT.",pros:["Wide coverage","No local infrastructure","High bandwidth"],cons:["Subscription cost","Power hungry","Antenna size"],considerations:["NB-IoT for low-power IoT","SIM management adds complexity","Consider eSIM for flexibility"],implication:"Adds a subscription to the product experience. Every month the bill arrives, the user evaluates whether your product is worth it. That's a retention problem, not just a cost." },
  { id:"nfc",cat:"connect",name:"NFC",sub:"Connect",img:"enable_NFC.png",desc:"Near-field communication. Touch-to-pair, touch-to-pay, data exchange.",pros:["Intuitive tap interaction","Passive tags need no power","Secure"],cons:["Very short range ~4cm","Low bandwidth"],considerations:["Great for pairing initiation then handoff to BLE","NFC tags are cheap and disposable","Metal near antenna degrades performance"],implication:"Touch-to-pair is one of the few onboarding moments users genuinely enjoy. Squandering it on a task that could have been automatic is a missed experience design opportunity." },
  { id:"gps",cat:"connect",name:"GPS",sub:"Connect",img:"enable_GPS.png",desc:"Satellite positioning. Outdoor location with meter-level accuracy.",pros:["Global coverage","Absolute positioning"],cons:["No indoor coverage","30-50mA draw","Slow cold start"],considerations:["Combine with accelerometer for dead reckoning between fixes","A-GPS via cellular reduces first-fix time","Needs clear sky view — antenna placement critical"],implication:"Outdoor accuracy, indoor nothing. If your use case crosses that boundary — a product used in a car and at home — you're designing for two different location models." },
  { id:"wirednetwork",cat:"connect",name:"Wired Network",sub:"Connect",img:"enable_wirednetwork.png",desc:"Ethernet connectivity. Reliable, fast, no wireless interference.",pros:["Reliable","Fast","No RF issues","PoE possible"],cons:["Physical cable required","Not mobile"],considerations:["Consider PoE for combined power + data","Good for stationary installations"],implication:"Removes portability as an option. Everything else in your design now branches: either you're stationary (with all the form-factor freedom that implies), or this connector is a problem." },
  { id:"antenna",cat:"connect",name:"Antenna",sub:"Connect",img:"enable_antenna.png",desc:"RF antenna design. Required for any wireless communication.",pros:["Enables all wireless comms"],cons:["Size vs frequency tradeoff","Affected by nearby materials"],considerations:["PCB antenna cheapest, external best performance","Keep clear of metal, batteries, hands","Match antenna to frequency band"],implication:"The antenna's clearance requirements constrain the enclosure before the industrial designer has drawn a line. It needs to be in the room at the start of form-factor conversations." },
  { id:"cloud",cat:"connect",name:"Cloud",sub:"Connect",img:"enable_cloud.png",desc:"Cloud services — storage, processing, ML inference, dashboards.",pros:["Unlimited processing","Data persistence","Remote access"],cons:["Requires internet","Latency","Privacy concerns","Ongoing cost"],considerations:["Edge computing reduces cloud dependency","Consider offline-first with cloud sync","GDPR/data residency for health data"],implication:"Adds a dependency that will outlive the hardware. Every product with a cloud component has a decommission problem: what happens to users when you turn the server off?" },

  // PORT
  { id:"usb",cat:"port",name:"USB",sub:"Port",img:"enableusb.png",desc:"Universal Serial Bus. Data transfer, power delivery, debugging.",pros:["Universal","Power + data","Debugging access"],cons:["Port adds vulnerability","Waterproofing challenge"],considerations:["USB-C for modern products","Consider magnetic connectors for wearables","Port cover for IP rating"],implication:"The port is the most vulnerable physical point on the product — exposed, repeatedly stressed, and usually the only path for firmware updates. Waterproofing and durability start here." },
  { id:"hdmi",cat:"port",name:"HDMI",sub:"Port",img:"enablehdmi.png",desc:"High-definition video/audio output. External display connection.",pros:["Standard AV output","High quality"],cons:["Large connector","Power draw"],considerations:["Mini/Micro HDMI for compact devices","Consider wireless display alternatives"],implication:"External display output assumes a screen exists to connect to — which defines the use context. This is a stationary, desk-adjacent product." },
  { id:"lan",cat:"port",name:"LAN",sub:"Port",img:"enablelan.png",desc:"RJ45 Ethernet port. Wired network connection.",pros:["Reliable","Fast","PoE capable"],cons:["Large connector","Stationary only"],considerations:["Consider PoE for single-cable installation","Magnetic jack for isolation"],implication:"A physical cable in a world of wireless — chosen for reliability, not convenience. Every RJ45 on a product is a statement that the use context is fixed and the designer meant it." },

  // CHARGING
  { id:"battery",cat:"charging",name:"Battery",sub:"Charging",img:"enable_battery.png",desc:"Rechargeable cell — LiPo, Li-ion, or alternatives.",pros:["Portable operation","Various form factors"],cons:["Limited life","Safety concerns","Weight"],considerations:["LiPo for flat/custom shapes","Include charge management IC","Consider user-replaceable vs sealed"],implication:"Portable operation at the cost of eventual failure. In a sealed product, a battery is a decommission problem — decide now whether users replace it or recycle the device." },
  { id:"wiredcharge",cat:"charging",name:"Wired Charge",sub:"Charging",img:"enable_wiredcharge.png",desc:"Cable-based charging — USB, barrel jack, or custom connector.",pros:["Fast charging","Simple","Reliable"],cons:["Port wear","Cable management"],considerations:["USB-C PD for universal charging","Magnetic connectors reduce port wear"],implication:"Fast and reliable, but the port adds a physical failure point and the cable adds a ritual. Every charging cable is a design decision that happens in the user's home, not in your lab." },
  { id:"wireless",cat:"charging",name:"Wireless Charge",sub:"Charging",img:"enable_wireless.png",desc:"Qi or custom inductive charging. No exposed contacts.",pros:["No port needed","Waterproof-friendly","Convenient"],cons:["Slower","Heat generation","Alignment sensitive"],considerations:["Qi standard for phone charger compatibility","Alignment magnets improve UX","Coil size affects charging area"],implication:"No exposed contacts — but slower, heat-generating, and alignment-sensitive. The user places the product; the coil either catches it or doesn't. That moment is in your hands." },
  { id:"solar",cat:"charging",name:"Solar Power",sub:"Charging",img:"enable_solarpower.png",desc:"Photovoltaic cells for energy harvesting.",pros:["Renewable","No cables","Low maintenance"],cons:["Weather dependent","Requires surface area","Low power output"],considerations:["Supplement, rarely sole power source","Consider indoor light harvesting panels","Pairs well with low-power design (BLE + e-ink)"],implication:"Energy harvesting rarely replaces a battery — it extends it. Designing for solar-only operation means designing for the worst-case day in December, not the best case in June." },

  // COOLING
  { id:"activecooling",cat:"cooling",name:"Active Cooling",sub:"Cooling",img:"enable_activecolling.png",desc:"Fan, Peltier, or liquid cooling. For high-performance processors.",pros:["Effective heat removal","Enables high performance"],cons:["Noise","Power draw","Moving parts"],considerations:["Fan noise is a UX issue","Consider heat pipe + small fan combo","Dust ingress with fan openings"],implication:"A fan introduces noise, vibration, and a dust ingress path the enclosure designer wasn't planning for. Before adding active cooling, ask what's generating the heat and whether it can stop." },
  { id:"passivecooling",cat:"cooling",name:"Passive Cooling",sub:"Cooling",img:"enable_passivecooling.png",desc:"Heatsinks, thermal pads, heat-spreading materials. Silent cooling.",pros:["Silent","No power","Reliable"],cons:["Limited thermal capacity","Needs airflow/surface area"],considerations:["Aluminum heatsinks for cost, copper for performance","Consider enclosure as heatsink","Thermal interface material selection matters"],implication:"Silent and reliable — but the heatsink needs surface area, and surface area needs space the industrial designer also wants. Thermal management belongs in the first sketch, not the last review." },

  // PLATFORM
  { id:"mcu",cat:"platform",name:"MCU",sub:"Platform",img:"enable_mcu.png",desc:"Microcontroller unit. The brain — Arduino, ESP32, STM32, Nordic nRF.",pros:["Low power","Real-time control","Small footprint"],cons:["Limited processing","Programming required"],considerations:["ESP32 for WiFi+BLE combo","Nordic nRF for BLE focus","Arduino for prototyping, production MCU for deployment"],implication:"The microcontroller sets the ceiling on processing, the floor on power consumption, and the shape of every firmware decision to come. Changing it mid-project is a reset, not a revision." },
  { id:"android",cat:"platform",name:"Android",sub:"Platform",img:"enable_android.png",desc:"Android OS — for rich UI, app ecosystem, complex processing.",pros:["Rich UI framework","App ecosystem","Camera/ML support"],cons:["Power hungry","Boot time","Complexity"],considerations:["Android Things discontinued — use standard Android","Consider Linux for headless applications","SBC like RPi for prototyping"],implication:"A rich UI framework and full app ecosystem — at the cost of boot time, power draw, and every Android security update for the product's lifetime. It's a platform you marry, not date." },
  { id:"windows",cat:"platform",name:"Windows",sub:"Platform",img:"enable_windows.png",desc:"Windows OS — for desktop/kiosk applications with full computing.",pros:["Full software ecosystem","Peripheral support","Development tools"],cons:["Heavy resources","Boot time","Licensing"],considerations:["Good for kiosks and installations","Consider Windows IoT for embedded","Overkill for simple embedded tasks"],implication:"Full desktop software compatibility in a form factor that may not need it. Every Windows-based embedded product is one update notification away from an unusable kiosk." },
];

// ── ASCII CARD GRAPHICS ────────────────────────────────────────
const CARD_GRAPHICS = {
  standing:"    ◉\n    │\n   ─┼─\n    │\n   ─┴─", sitting:"   ◉\n   │\n  ─┤\n   │──\n   ┘", wearable:" ─╭────╮─\n  │ ◉  │\n ─╰────╯─", vehicle:"  ┌───┐\n ─┤   ├─\n  ○   ○", phone:"  ┌──┐\n  │  │\n  │○ │\n  └──┘", outdoor:"   /\\\n  /  \\\n /────\\\n  ────", indoor:"  ┌──┐\n  ┤  ├\n  ┤  ├\n  └──┘", social:" ◉ ◉ ◉\n │ │ │\n─┴─┴─┴─", tap:"    ▼\n   ─┼─\n    │\n   ─┴─", drag:"  ◁───▷\n  │   │\n    ▽", shake:" ≋  ≋  ≋\n≋  ≋  ≋ \n ≋  ≋  ≋", hover:"  ·  ·  ·\n   · ◈ ·\n  ·  ·  ·", tilt:" ╭────╮\n╱      ╲\n        ", button:"   ╭──╮\n   │██│\n   ╰──╯\n   └──┘", jogwheel:"  ╭──╮\n ─┤  ├─\n  ╰──╯\n    ↻", slider:" ────┬──\n     │\n  ───────", joystick:"    │\n    ◉\n  ──┘└──\n  ──────", keyboard:" ┌┐┌┐┌┐\n └┘└┘└┘\n ┌─────┐\n └─────┘", wifi:"  ((()))\n ((   ))\n((     ))\n    ◉", bluetooth:"   ─┐\n   │╲\n   │╱\n   │╲\n   │╱\n   ─┘", battery:" ┌──────┐\n─┤██████│\n─┤████░░│\n └──────┘", solar:" ╔═╗╔═╗\n ╚═╝╚═╝\n     │\n    ─┴─", mcu:"  ┌┬┬┬┐\n  ├┤ ├┤\n  ├┼◈┼┤\n  ├┤ ├┤\n  └┴┴┴┘", android:"  ╭───╮\n  │◉ ◉│\n  │ ▽ │\n  └───┘", windows:"  ┌─┬─┐\n  │▓│▓│\n  ├─┼─┤\n  │▓│▓│\n  └─┴─┘", nfc:"     ─\n    ─ ─\n   ─   ─\n     ◈", gps:"    /\\\n   /  \\\n  / ◈  \\\n  ──────", light:"   ·*·\n  * ◉ *\n   ·*·\n    │\n    ┴", sound:"    ))\n  ─▐█▌─\n    ))\n   ─┴─", vibration:"  ≋ ≋ ≋\n ≋ ≋ ≋ ≋\n  ≋ ≋ ≋\n ≋ ≋ ≋ ≋", lcd:" ╔═════╗\n ║ ████║\n ╚═════╝\n   ─┴─", eink:"  ┌─────┐\n  │  ──  │\n  │ ─── │\n  └─────┘", healthsensor:"    ♡\n   ─◉─\n    │\n  ──┴──", soundsensor:"   ))))\n   ▐██▌\n   ────", infrared:"  ──▷\n  ──▷\n  ──▷\n    ◈", cloud:" ╭──╮╮\n ╰───╮│\n     ╰╯", usb:" ─┤USB├─\n  └────┘\n     │\n     ┴", activecooling:"  ↑↑↑\n  ─────\n  ╔═══╗\n  ╚═══╝", passivecooling:"▐████▌\n ──────\n▐████▌\n ──────",
  scenario:"   ╭──╮\n   │◉◉│\n   ╰─┬╯\n     │\n   ──┴──", gesture:"     ▽\n   ╱─╲\n  │   │\n  │   │\n   ───", control:" ┌─┐ ┌─┐\n │●│ │●│\n └─┘ └─┘\n  ━━━━━", sensor:"   )◈(\n  ))◈((\n )))◈(((\n   ─┴─\n   ───", camera:"  ╭───╮\n  │ ◎ │\n  ╰───╯\n    ┴", display:"  ╔═══╗\n  ║░▓░║\n  ║▓░▓║\n  ╚═══╝\n   ─┴─", feedback:"  ≋ ≋ ≋\n ≋ ≋ ≋ ≋\n  ≋ ≋ ≋\n ≋ ≋ ≋ ≋", connect:"   ◉─◉\n  ╱│ │╲\n ◉  │  ◉\n  ╲│ │╱\n   ◉─◉", port:"  ┌────┐\n  │▐▌▐▌│\n  └────┘", charging:"  ┌────┐\n┌─┤████│\n└─┤██░░│\n  └────┘", cooling:"  ↑  ↑  ↑\n  │  │  │\n  ═══════\n  ╱╱╱╱╱╱", platform:"  ┌─┬─┐\n  ├─┼─┤\n  │ ◈ │\n  ├─┼─┤\n  └─┴─┘",
};

const CATEGORIES = {
  scenario:{ label:"Scenario", color:"#F4ADCB", group:"context" },
  gesture: { label:"Gesture",  color:"#FFBE7A", group:"input" },
  control: { label:"Control",  color:"#FF8C69", group:"input" },
  sensor:  { label:"Sensor",   color:"#C4ADFF", group:"input" },
  camera:  { label:"Camera",   color:"#7BAAFF", group:"input" },
  display: { label:"Display",  color:"#5BC8FF", group:"output" },
  feedback:{ label:"Feedback", color:"#5BEFEF", group:"output" },
  connect: { label:"Connect",  color:"#5BE8A4", group:"enable" },
  port:    { label:"Port",     color:"#3DCC80", group:"enable" },
  charging:{ label:"Charging", color:"#FFD040", group:"enable" },
  cooling: { label:"Cooling",  color:"#80B8D4", group:"enable" },
  platform:{ label:"Platform", color:"#C8FF00", group:"enable" },
};

const GROUPS = {
  context:{ label:"SCENARIO", color:"#F4ADCB" },
  input:  { label:"INPUT",    color:"#FFBE7A" },
  output: { label:"OUTPUT",   color:"#5BC8FF" },
  enable: { label:"ENABLE",   color:"#5BE8A4" },
};

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
  { if:["healthsensor"],needs:["mcu"],msg:"Health sensors need MCU for signal processing." },
  { if:["soundsensor"],needs:["mcu"],msg:"Sound sensor/microphone needs MCU for audio processing." },
  { if:["android"],needs:["battery","wiredcharge"],msg:"Android platform needs substantial power.",any:true },
  { if:["activecooling"],needs:["battery","wiredcharge"],msg:"Active cooling (fans) needs power.",any:true },
  { if:["solar"],suggests:["outdoor"],msg:"Solar charging works best in outdoor scenarios." },
  { if:["wearable"],suggests:["bluetooth"],msg:"Wearables typically pair with a phone via BLE." },
  { if:["wearable"],suggests:["battery"],msg:"Wearables need portable power." },
  { if:["vehicle"],suggests:["wiredcharge"],msg:"Vehicles provide 12V power — wired charging available." },
  { if:["outdoor"],suggests:["passivecooling"],msg:"Outdoor environments may need thermal management." },
];

// ── ARCHETYPES ────────────────────────────────────────────────
const ARCHETYPES = [
  {
    id:"ambient",
    name:"AMBIENT",
    sub:"Always-on awareness",
    desc:"Background sensing, minimal interaction, persistent presence.",
    character:"A product that lives in the periphery — sensing, recording, occasionally surfacing what matters. It earns trust by staying out of the way and reveals its value over time rather than immediately. The failure mode is invisibility: when it stops working, nobody notices until it's too late.",
    seeds:["stationary","indoor","individual","lightsensor","tempsensor","motionsensor","eink","light","wifi","cloud","mcu","passivecooling"],
    keywords:["ambient","background","passive","always on","monitoring","sensor","environment","quiet","invisible"],
  },
  {
    id:"reactive",
    name:"REACTIVE",
    sub:"Event-driven response",
    desc:"Dormant until triggered, sharp and immediate when activated.",
    character:"A product that waits without wasting — dormant until something meaningful happens, then immediate and clear. The challenge is defining what 'meaningful' means precisely enough that it's never wrong. False positives erode trust faster than silence does.",
    seeds:["mobile","individual","button","tap","press","motionsensor","vibration","light","bluetooth","battery","mcu"],
    keywords:["reactive","event","trigger","alert","notification","response","motion","detect","wake"],
  },
  {
    id:"precision",
    name:"PRECISION",
    sub:"Control-focused",
    desc:"High-fidelity control for users who know exactly what they want.",
    character:"A product built for mastery — it rewards expertise and forgives nothing. Every control surface says 'you're in charge.' The risk is that this reads as complexity to anyone who isn't already invested, which limits the audience and raises the cost of onboarding.",
    seeds:["sitting","stationary","indoor","individual","jogwheel","slider","button","touchpad","lcd","sound","wiredcharge","mcu","passivecooling"],
    keywords:["precision","control","professional","expert","knob","dial","fine","accurate","studio","instrument"],
  },
  {
    id:"social",
    name:"SOCIAL",
    sub:"Shared, multi-person",
    desc:"Designed for multiple users, public contexts, and shared rituals.",
    character:"A product that performs as much as it functions — visible, readable, and legible to people who didn't ask to be involved. Every design decision is also a decision about what bystanders experience. Discretion requires active effort; visibility is the default.",
    seeds:["stationary","indoor","social","tap","multitouch","button","lcd","sound","light","wifi","nfc","cloud","wiredcharge","android","passivecooling"],
    keywords:["social","shared","public","collaborative","kiosk","display","multi","group","meeting","space"],
  },
  {
    id:"bodyaware",
    name:"BODY-AWARE",
    sub:"Worn, biometric, continuous",
    desc:"Lives on or near the body, sensing the user's physical state.",
    character:"A product that knows the body — continuous, close, and personal. It earns its place by being invisible when things are normal and clear when they're not. Comfort is a feature, not a finishing detail. The skin-contact interface is more important than any screen.",
    seeds:["wearable","mobile","individual","tap","tilt","healthsensor","motionsensor","vibration","light","bluetooth","battery","mcu"],
    keywords:["wearable","body","health","biometric","heart","fitness","skin","worn","medical","personal"],
  },
];

// ── CANVAS LAYOUT ─────────────────────────────────────────────
const CLUSTER_LAYOUT = {
  scenario:{ x:40,   y:80,   cols:2 },
  gesture: { x:400,  y:80,   cols:3 },
  control: { x:400,  y:680,  cols:3 },
  sensor:  { x:960,  y:80,   cols:2 },
  camera:  { x:960,  y:980,  cols:3 },
  display: { x:1300, y:80,   cols:2 },
  feedback:{ x:1300, y:500,  cols:2 },
  connect: { x:1640, y:80,   cols:2 },
  port:    { x:1640, y:680,  cols:2 },
  charging:{ x:1640, y:880,  cols:2 },
  cooling: { x:1980, y:80,   cols:1 },
  platform:{ x:1980, y:280,  cols:1 },
};

const NODE_W = 152;
const NODE_H = 86;
const NODE_GAP_X = 10;
const NODE_GAP_Y = 8;
const CANVAS_W = 2200;
const CANVAS_H = 1300;

const getNodePos = (card) => {
  const cats = CARDS.filter(c => c.cat === card.cat);
  const idx = cats.findIndex(c => c.id === card.id);
  const layout = CLUSTER_LAYOUT[card.cat] || { x:0, y:0, cols:2 };
  const col = idx % layout.cols;
  const row = Math.floor(idx / layout.cols);
  return { x: layout.x + col * (NODE_W + NODE_GAP_X), y: layout.y + row * (NODE_H + NODE_GAP_Y) };
};

// ── PROFILES ─────────────────────────────────────────────────
const PROFILES = [
  { name:"Cycling Nav Band", desc:"Wrist-worn haptic navigation for cyclists. No screen — vibration patterns indicate turns.", cards:["mobile","outdoor","wearable","tap","tilt","shake","motionsensor","healthsensor","vibration","light","bluetooth","gps","battery","mcu","passivecooling"], color:"#E8A0BF" },
  { name:"Smart Payment Terminal", desc:"Connected POS device with touchscreen, NFC, and multiple connectivity options.", cards:["stationary","indoor","individual","tap","multitouch","button","lightsensor","lcd","sound","light","vibration","wifi","bluetooth","nfc","cellular","usb","battery","wiredcharge","mcu","android","passivecooling"], color:"#D4A98C" },
  { name:"Air Quality Monitor", desc:"Indoor environmental sensor hub. E-ink display, WiFi connected, cloud dashboard.", cards:["stationary","indoor","individual","tap","airsensor","tempsensor","humidity","gassensor","lightsensor","eink","light","wifi","cloud","usb","wiredcharge","mcu","passivecooling"], color:"#8CC5A0" },
  { name:"Smart Retail Tag", desc:"BLE beacon with e-ink price display. Battery powered, long life, cloud-managed.", cards:["stationary","indoor","social","beacon","eink","light","bluetooth","nfc","cloud","battery","mcu"], color:"#8BAFC4" },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function EETIToolkit() {
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(new Set());
  const [activeArchetype, setActiveArchetype] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x:80, y:80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x:0, y:0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [query, setQuery] = useState("");
  const [projectName, setProjectName] = useState("Untitled Project");
  // Legacy list view state
  const [activeCat, setActiveCat] = useState("scenario");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState(new Set());
  const canvasRef = useRef(null);

  const toggle = useCallback((id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const loadProfile = useCallback((p) => {
    setSelected(new Set(p.cards));
    setProjectName(p.name);
    setActiveArchetype(null);
    setView("canvas");
  }, []);

  const openCanvas = useCallback((archetypeId, querySeeds) => {
    const seeds = archetypeId
      ? (ARCHETYPES.find(a => a.id === archetypeId)?.seeds || [])
      : Array.from(querySeeds || []);
    setSelected(new Set(seeds));
    setActiveArchetype(archetypeId ? ARCHETYPES.find(a => a.id === archetypeId) : null);
    if (seeds.length > 0) {
      const positions = seeds.map(id => { const c = CARDS.find(x => x.id === id); return c ? getNodePos(c) : null; }).filter(Boolean);
      const avgX = positions.reduce((s,p) => s + p.x, 0) / positions.length;
      const avgY = positions.reduce((s,p) => s + p.y, 0) / positions.length;
      setCanvasOffset({ x: Math.max(60, -avgX + 560), y: Math.max(60, -avgY + 320) });
    }
    setView("canvas");
  }, []);

  const handleQuerySubmit = useCallback(() => {
    if (!query.trim()) { setView("canvas"); return; }
    const q = query.toLowerCase();
    const matched = CARDS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q) ||
      c.cat.includes(q) ||
      c.sub.toLowerCase().includes(q)
    );
    openCanvas(null, new Set(matched.map(c => c.id)));
  }, [query, openCanvas]);

  const archetypeScore = useCallback((a) => {
    if (!query.trim()) return 0;
    const q = query.toLowerCase();
    let s = 0;
    if (a.name.toLowerCase().includes(q)) s += 4;
    if (a.sub.toLowerCase().includes(q)) s += 2;
    if (a.desc.toLowerCase().includes(q)) s += 1;
    a.keywords.forEach(k => { if (k.includes(q) || q.includes(k)) s += 1; });
    return s;
  }, [query]);

  const analysis = useMemo(() => {
    const gaps = [], suggestions = [];
    DEPENDENCIES.forEach(rule => {
      const triggered = rule.if.some(id => selected.has(id));
      if (!triggered) return;
      const triggerNames = rule.if.filter(id => selected.has(id)).map(id => CARDS.find(c=>c.id===id)?.name);
      if (rule.needs) {
        const met = rule.any ? rule.needs.some(id => selected.has(id)) : rule.needs.every(id => selected.has(id));
        if (!met) {
          const needed = rule.needs.map(id => CARDS.find(c=>c.id===id)?.name).filter(Boolean);
          gaps.push({ trigger:triggerNames.join(", "), needs:needed.join(rule.any?" or ":"+"), msg:rule.msg, needIds:rule.needs, any:rule.any });
        }
      }
      if (rule.suggests) {
        const met = rule.suggests.some(id => selected.has(id));
        if (!met) {
          const suggested = rule.suggests.map(id => CARDS.find(c=>c.id===id)?.name).filter(Boolean);
          suggestions.push({ trigger:triggerNames.join(", "), suggests:suggested.join(", "), msg:rule.msg, suggestIds:rule.suggests });
        }
      }
    });
    return { gaps, suggestions };
  }, [selected]);

  const selectedCards = useMemo(() => CARDS.filter(c => selected.has(c.id)), [selected]);

  const edges = useMemo(() => {
    const selArr = Array.from(selected);
    const pairs = [];
    for (let i = 0; i < selArr.length; i++) {
      for (let j = i+1; j < selArr.length; j++) {
        const a = selArr[i], b = selArr[j];
        const linked = DEPENDENCIES.some(rule =>
          (rule.if.includes(a) && (rule.needs?.includes(b) || rule.suggests?.includes(b))) ||
          (rule.if.includes(b) && (rule.needs?.includes(a) || rule.suggests?.includes(a)))
        );
        if (linked) pairs.push([a, b]);
      }
    }
    return pairs;
  }, [selected]);

  const filteredCards = useMemo(() => {
    let cards = CARDS.filter(c => c.cat === activeCat);
    if (search) cards = cards.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));
    return cards;
  }, [activeCat, search]);

  const countByCat = useMemo(() => {
    const m = {};
    selected.forEach(id => { const c = CARDS.find(x=>x.id===id); if (c) m[c.cat] = (m[c.cat]||0)+1; });
    return m;
  }, [selected]);

  // Canvas pan handlers
  const onCanvasMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.dataset.canvasBg) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      e.preventDefault();
    }
  }, [canvasOffset]);

  const onCanvasMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setCanvasOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const onCanvasMouseUp = useCallback(() => setIsDragging(false), []);

  // ── STYLES ────────────────────────────────────────────────
  const bg = "#0B0B0B", surface = "#151515", surfaceLight = "#1E1E1E", border = "#2A2A2A";
  const text = "#E8E6E1", textDim = "#888", lime = "#C8FF00";
  const mono = { fontFamily:"'IBM Plex Mono',monospace" };

  const s = {
    root:{ fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:bg, color:text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
    nav:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:`1px solid ${border}`, background:surface, position:"sticky", top:0, zIndex:200 },
    logo:{ ...mono, fontSize:18, fontWeight:700, letterSpacing:"0.2em", color:lime },
    navBtn:(active)=>({ padding:"7px 14px", borderRadius:6, border:"none", background:active?lime:"transparent", color:active?bg:textDim, fontSize:12, fontWeight:600, cursor:"pointer", ...mono, letterSpacing:"0.03em", transition:"all 0.15s" }),
    panel:{ background:surface, border:`1px solid ${border}`, borderRadius:10, padding:20, marginBottom:16 },
    btnPrimary:{ padding:"10px 20px", borderRadius:8, border:"none", background:lime, color:bg, fontSize:13, fontWeight:700, cursor:"pointer", ...mono },
    btnSecondary:{ padding:"10px 20px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:13, fontWeight:600, cursor:"pointer", ...mono },
    tag:(color)=>({ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, background:color+"22", color, ...mono, letterSpacing:"0.05em" }),
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>

      {/* NAV */}
      <div style={s.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={s.logo}>▸ EETI</span>
          <span style={{ fontSize:11, color:textDim, ...mono }}>Embedded Embodied Tangible Interactions</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[["home","Home"],["canvas","Canvas"],["list","List"],["analysis","Analysis"],["profiles","Profiles"]].map(([v,l])=>(
            <button key={v} style={s.navBtn(view===v)} onClick={()=>setView(v)}>{l}</button>
          ))}
          {selected.size > 0 && (
            <button style={{ ...s.navBtn(false), color:"#f66" }} onClick={()=>{setSelected(new Set());setActiveArchetype(null);setProjectName("Untitled Project")}}>Reset</button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          HOME — Hybrid A+B entry
      ══════════════════════════════════════════════════ */}
      {view === "home" && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"64px 24px" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:52, fontWeight:400, fontStyle:"italic", lineHeight:1.1, marginBottom:12, color:text }}>
              Design with<br/><span style={{ color:lime }}>every sense</span>
            </h1>
            <p style={{ fontSize:16, color:textDim, maxWidth:480, margin:"0 auto 40px", lineHeight:1.7 }}>
              A consequence engine for embedded tech decisions. Explore component combinations and understand what they mean for the experience.
            </p>

            {/* Query input */}
            <div style={{ display:"flex", gap:0, maxWidth:520, margin:"0 auto 12px", borderRadius:10, overflow:"hidden", border:`1px solid ${border}`, background:surfaceLight }}>
              <input
                type="text"
                placeholder="What are you building? e.g. wearable health monitor…"
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleQuerySubmit()}
                style={{ flex:1, padding:"14px 18px", background:"transparent", border:"none", color:text, fontSize:14, outline:"none", ...mono }}
              />
              <button
                onClick={handleQuerySubmit}
                style={{ padding:"14px 20px", background:lime, border:"none", color:bg, fontSize:13, fontWeight:700, cursor:"pointer", ...mono, flexShrink:0 }}
              >→</button>
            </div>
            <div style={{ fontSize:11, color:textDim, ...mono }}>or choose an experience character below</div>
          </div>

          {/* Archetype tiles */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
            {ARCHETYPES.slice(0,3).map(a => {
              const score = archetypeScore(a);
              const highlighted = query.trim() && score > 0;
              return (
                <button
                  key={a.id}
                  onClick={()=>openCanvas(a.id)}
                  style={{
                    background: highlighted ? surfaceLight : surface,
                    border:`1px solid ${highlighted ? lime : border}`,
                    borderRadius:12, padding:"20px 20px", textAlign:"left", cursor:"pointer",
                    transition:"all 0.15s", color:text,
                    boxShadow: highlighted ? `0 0 0 1px ${lime}33` : "none",
                  }}
                >
                  <div style={{ ...mono, fontSize:10, color:highlighted?lime:textDim, letterSpacing:"0.15em", marginBottom:6 }}>{a.name}</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{a.sub}</div>
                  <div style={{ fontSize:12, color:textDim, lineHeight:1.5 }}>{a.desc}</div>
                  <div style={{ marginTop:12, ...mono, fontSize:10, color:lime }}>Explore →</div>
                </button>
              );
            })}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:40 }}>
            {ARCHETYPES.slice(3).map(a => {
              const score = archetypeScore(a);
              const highlighted = query.trim() && score > 0;
              return (
                <button
                  key={a.id}
                  onClick={()=>openCanvas(a.id)}
                  style={{
                    background: highlighted ? surfaceLight : surface,
                    border:`1px solid ${highlighted?lime:border}`,
                    borderRadius:12, padding:"20px 20px", textAlign:"left", cursor:"pointer",
                    transition:"all 0.15s", color:text,
                    boxShadow: highlighted ? `0 0 0 1px ${lime}33` : "none",
                  }}
                >
                  <div style={{ ...mono, fontSize:10, color:highlighted?lime:textDim, letterSpacing:"0.15em", marginBottom:6 }}>{a.name}</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{a.sub}</div>
                  <div style={{ fontSize:12, color:textDim, lineHeight:1.5 }}>{a.desc}</div>
                  <div style={{ marginTop:12, ...mono, fontSize:10, color:lime }}>Explore →</div>
                </button>
              );
            })}
          </div>

          <div style={{ textAlign:"center" }}>
            <button style={s.btnSecondary} onClick={()=>openCanvas(null, new Set())}>Open blank canvas →</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CANVAS VIEW
      ══════════════════════════════════════════════════ */}
      {view === "canvas" && (
        <div style={{ display:"flex", height:"calc(100vh - 57px)", overflow:"hidden" }}>

          {/* Canvas area */}
          <div
            ref={canvasRef}
            data-canvas-bg="true"
            style={{ flex:1, position:"relative", overflow:"hidden", cursor:isDragging?"grabbing":"grab", background:bg }}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onMouseLeave={onCanvasMouseUp}
          >
            {/* Mini-map hint */}
            <div style={{ position:"absolute", top:12, left:12, ...mono, fontSize:10, color:textDim, zIndex:10, background:`${surface}cc`, padding:"4px 10px", borderRadius:4, border:`1px solid ${border}`, pointerEvents:"none" }}>
              drag to pan · {selected.size} selected
            </div>

            {/* Canvas inner — positioned content */}
            <div style={{ position:"absolute", top:canvasOffset.y, left:canvasOffset.x, width:CANVAS_W, height:CANVAS_H }}>

              {/* SVG edges */}
              <svg style={{ position:"absolute", top:0, left:0, width:CANVAS_W, height:CANVAS_H, pointerEvents:"none", zIndex:1 }}>
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill={lime} fillOpacity="0.5"/>
                  </marker>
                </defs>
                {edges.map(([aId,bId],i) => {
                  const cardA = CARDS.find(c=>c.id===aId);
                  const cardB = CARDS.find(c=>c.id===bId);
                  if (!cardA||!cardB) return null;
                  const posA = getNodePos(cardA);
                  const posB = getNodePos(cardB);
                  const x1=posA.x+NODE_W/2, y1=posA.y+NODE_H/2;
                  const x2=posB.x+NODE_W/2, y2=posB.y+NODE_H/2;
                  const gap = DEPENDENCIES.some(r=>r.if.includes(aId)&&r.needs?.includes(bId)||r.if.includes(bId)&&r.needs?.includes(aId));
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={gap?"#F90":lime} strokeWidth="1.5" strokeOpacity={gap?0.6:0.35}
                      strokeDasharray={gap?"6 3":"4 4"}
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
              </svg>

              {/* Cluster labels */}
              {Object.entries(CLUSTER_LAYOUT).map(([cat, layout]) => {
                const g = GROUPS[CATEGORIES[cat]?.group];
                return (
                  <div key={cat} style={{
                    position:"absolute",
                    left:layout.x, top:layout.y - 28,
                    ...mono, fontSize:9, fontWeight:700, letterSpacing:"0.18em",
                    color:g?.color||textDim, opacity:0.7, pointerEvents:"none",
                    textTransform:"uppercase"
                  }}>{CATEGORIES[cat]?.label}</div>
                );
              })}

              {/* Nodes */}
              {CARDS.map(card => {
                const pos = getNodePos(card);
                const sel = selected.has(card.id);
                const hov = hoveredNode === card.id;
                const catColor = CATEGORIES[card.cat]?.color || "#888";

                return (
                  <div
                    key={card.id}
                    style={{
                      position:"absolute", left:pos.x, top:pos.y,
                      width:NODE_W, height:NODE_H,
                      background: sel ? "#1E1E1E" : surface,
                      border:`1px solid ${sel ? lime : hov ? catColor : border}`,
                      borderLeft:`3px solid ${catColor}`,
                      borderRadius:8,
                      cursor:"pointer",
                      transition:"border-color 0.1s, box-shadow 0.1s, background 0.1s",
                      boxShadow: sel ? `0 0 0 1px ${lime}44, 0 2px 12px ${lime}22` : hov ? `0 2px 8px rgba(0,0,0,0.4)` : "none",
                      zIndex: sel||hov ? 10 : 2,
                      overflow:"hidden",
                      padding:"8px 10px",
                      display:"flex", flexDirection:"column", justifyContent:"space-between",
                      userSelect:"none",
                    }}
                    onClick={()=>toggle(card.id)}
                    onMouseEnter={()=>setHoveredNode(card.id)}
                    onMouseLeave={()=>setHoveredNode(null)}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{ ...mono, fontSize:8, fontWeight:700, letterSpacing:"0.12em", color:catColor, textTransform:"uppercase", lineHeight:1.2 }}>{card.sub}</span>
                      <span style={{ ...mono, fontSize:10, color:sel?lime:"#444", fontWeight:700 }}>{sel?"✓":"+"}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:text, marginBottom:2, lineHeight:1.2 }}>{card.name}</div>
                      <div style={{ fontSize:9, color:textDim, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {card.implication}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>{/* end canvas inner */}
          </div>{/* end canvas area */}

          {/* ── Consequence Panel ── */}
          <div style={{ width:300, borderLeft:`1px solid ${border}`, background:surface, overflowY:"auto", flexShrink:0, display:"flex", flexDirection:"column" }}>
            {/* Archetype chip */}
            {activeArchetype && (
              <div style={{ padding:"16px 16px 0" }}>
                <div style={{ background:`${lime}11`, border:`1px solid ${lime}44`, borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ ...mono, fontSize:9, color:lime, letterSpacing:"0.15em", marginBottom:4 }}>ARCHETYPE</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{activeArchetype.name} — {activeArchetype.sub}</div>
                  <div style={{ fontSize:11, color:textDim, lineHeight:1.55 }}>{activeArchetype.character}</div>
                </div>
              </div>
            )}

            {/* Selected count */}
            <div style={{ padding:"14px 16px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ ...mono, fontSize:10, color:textDim, letterSpacing:"0.1em" }}>SELECTED</span>
              <span style={{ ...mono, fontSize:12, color:lime, fontWeight:700 }}>{selected.size}</span>
            </div>

            {selected.size === 0 ? (
              <div style={{ padding:"0 16px", fontSize:12, color:textDim, lineHeight:1.6 }}>
                Click nodes on the canvas to select components. Consequence implications will appear here.
              </div>
            ) : (
              <>
                {/* Implications */}
                <div style={{ padding:"0 16px", flex:1 }}>
                  {selectedCards.map(card => {
                    const catColor = CATEGORIES[card.cat]?.color||"#888";
                    return (
                      <div key={card.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <span style={{ ...mono, fontSize:9, fontWeight:700, color:catColor, letterSpacing:"0.1em" }}>{card.sub.toUpperCase()}</span>
                          <button onClick={()=>toggle(card.id)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:12, padding:"0 2px" }}>×</button>
                        </div>
                        <div style={{ fontSize:12, fontWeight:600, color:text, marginBottom:4 }}>{card.name}</div>
                        <div style={{ fontSize:11, color:textDim, lineHeight:1.55 }}>{card.implication}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Gaps */}
                {analysis.gaps.length > 0 && (
                  <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}` }}>
                    <div style={{ ...mono, fontSize:9, color:"#F90", letterSpacing:"0.12em", marginBottom:8 }}>⚠ {analysis.gaps.length} GAPS</div>
                    {analysis.gaps.map((g,i)=>(
                      <div key={i} style={{ marginBottom:10, paddingLeft:8, borderLeft:"2px solid #F90" }}>
                        <div style={{ fontSize:10, color:"#F90", fontWeight:600, marginBottom:2 }}>{g.trigger}</div>
                        <div style={{ fontSize:10, color:textDim, marginBottom:4 }}>{g.msg}</div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {g.needIds.map(nid => { const nc=CARDS.find(c=>c.id===nid); return nc?(
                            <button key={nid} onClick={()=>toggle(nid)} style={{ ...mono, fontSize:9, padding:"2px 7px", borderRadius:4, border:"1px solid #F90", background:"transparent", color:"#F90", cursor:"pointer" }}>+{nc.name}</button>
                          ):null; })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}` }}>
                    <div style={{ ...mono, fontSize:9, color:"#69F", letterSpacing:"0.12em", marginBottom:8 }}>💡 SUGGESTIONS</div>
                    {analysis.suggestions.map((sg,i)=>(
                      <div key={i} style={{ marginBottom:8, fontSize:10, color:textDim }}>
                        <div style={{ marginBottom:4 }}>{sg.msg}</div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {sg.suggestIds.map(sid => { const sc=CARDS.find(c=>c.id===sid); return sc?(
                            <button key={sid} onClick={()=>toggle(sid)} style={{ ...mono, fontSize:9, padding:"2px 7px", borderRadius:4, border:"1px solid #69F", background:"transparent", color:"#69F", cursor:"pointer" }}>+{sc.name}</button>
                          ):null; })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.gaps.length===0 && (
                  <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}` }}>
                    <div style={{ ...mono, fontSize:9, color:lime, letterSpacing:"0.12em" }}>✓ ALL DEPENDENCIES MET</div>
                  </div>
                )}

                <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}` }}>
                  <button style={s.btnPrimary} onClick={()=>setView("analysis")}>Full Analysis →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          LIST VIEW (legacy build view, preserved)
      ══════════════════════════════════════════════════ */}
      {view === "list" && (
        <div style={{ display:"flex", height:"calc(100vh - 57px)" }}>
          {/* Sidebar */}
          <div style={{ width:220, borderRight:`1px solid ${border}`, padding:"16px 0", overflowY:"auto", flexShrink:0 }}>
            <div style={{ padding:"0 20px 12px", ...mono, fontSize:11, color:textDim, letterSpacing:"0.1em" }}>CATEGORIES</div>
            {Object.entries(GROUPS).map(([gk,g])=>(
              <div key={gk}>
                <div style={{ padding:"8px 20px 4px", ...mono, fontSize:10, color:g.color, letterSpacing:"0.15em", fontWeight:600 }}>{g.label}</div>
                {Object.entries(CATEGORIES).filter(([,v])=>v.group===gk).map(([ck,cv])=>(
                  <button key={ck}
                    style={{ width:"100%", padding:"10px 20px", border:"none", background:activeCat===ck?"#1E1E1E":"transparent", color:activeCat===ck?text:textDim, fontSize:13, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'IBM Plex Sans',sans-serif", transition:"all 0.1s" }}
                    onClick={()=>{setActiveCat(ck);setSearch("")}}
                  >
                    <span>{cv.label}</span>
                    {countByCat[ck]>0 && <span style={{ ...mono, fontSize:11, color:lime, fontWeight:700 }}>{countByCat[ck]}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Cards grid */}
          <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
            <div style={{ padding:"20px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <span style={{ ...mono, fontSize:12, color:CATEGORIES[activeCat]?.color, letterSpacing:"0.1em", fontWeight:600 }}>
                  {GROUPS[CATEGORIES[activeCat]?.group]?.label} / {CATEGORIES[activeCat]?.label.toUpperCase()}
                </span>
                <span style={{ ...mono, fontSize:11, color:textDim, marginLeft:12 }}>{filteredCards.length} components</span>
              </div>
              <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ padding:"8px 14px", borderRadius:6, border:`1px solid ${border}`, background:surfaceLight, color:text, fontSize:13, width:200, outline:"none", ...mono }}
              />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, padding:"0 20px 20px", alignItems:"start" }}>
              {filteredCards.map((card,i) => {
                const sel = selected.has(card.id);
                const flipped = flippedCards.has(card.id);
                const catColor = CATEGORIES[card.cat]?.color||"#888";
                const graphic = CARD_GRAPHICS[card.id]||CARD_GRAPHICS[card.cat]||"   ·\n  ···\n   ·";
                const ink="#0D0D0D", inkMid="rgba(0,0,0,0.55)", inkFaint="rgba(0,0,0,0.28)", inkBg="rgba(0,0,0,0.07)";

                return (
                  <div key={card.id} style={{ height:340, perspective:"1000px", animation:`fadeIn 0.2s ease ${i*30}ms both` }}>
                    <div style={{ position:"relative", height:"100%", transformStyle:"preserve-3d", transition:"transform 0.48s cubic-bezier(0.4,0,0.2,1)", transform:flipped?"rotateY(180deg)":"rotateY(0deg)" }}>
                      {/* FRONT */}
                      <div onClick={()=>setFlippedCards(p=>{const n=new Set(p);n.has(card.id)?n.delete(card.id):n.add(card.id);return n;})}
                        style={{ position:"absolute", top:0, left:0, right:0, bottom:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", background:catColor, borderRadius:12, padding:"14px 15px", overflow:"hidden", cursor:"pointer", display:"flex", flexDirection:"column", boxShadow:sel?`0 0 0 2.5px ${ink}`:"0 1px 4px rgba(0,0,0,0.15)", transition:"box-shadow 0.15s" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ ...mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, textTransform:"uppercase" }}>{card.sub}</span>
                          <button onClick={e=>{e.stopPropagation();toggle(card.id);}}
                            style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, border:`2px solid ${sel?ink:"rgba(0,0,0,0.22)"}`, background:sel?ink:"transparent", color:sel?catColor:"rgba(0,0,0,0.4)", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, padding:0, transition:"all 0.15s" }}
                          >{sel?"✓":"+"}</button>
                        </div>
                        <pre style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:1.38, margin:"0 0 11px", padding:"10px 12px", background:inkBg, borderRadius:7, color:inkMid, overflow:"hidden", whiteSpace:"pre", flexShrink:0 }}>{graphic}</pre>
                        <div style={{ fontSize:17, fontWeight:700, color:ink, letterSpacing:"-0.01em", marginBottom:5, lineHeight:1.2 }}>{card.name}</div>
                        <div style={{ fontSize:12, lineHeight:1.55, color:"rgba(0,0,0,0.6)", flex:1, overflow:"hidden" }}>{card.desc}</div>
                        <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                          <span style={{ ...mono, fontSize:9, color:inkFaint, letterSpacing:"0.06em" }}>flip for pros / cons</span>
                          <span style={{ ...mono, fontSize:10, color:inkFaint }}>↺</span>
                        </div>
                      </div>
                      {/* BACK */}
                      <div onClick={()=>setFlippedCards(p=>{const n=new Set(p);n.has(card.id)?n.delete(card.id):n.add(card.id);return n;})}
                        style={{ position:"absolute", top:0, left:0, right:0, bottom:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", transform:"rotateY(180deg)", background:catColor, borderRadius:12, padding:"14px 15px", overflow:"hidden", cursor:"pointer", display:"flex", flexDirection:"column" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:ink }}>{card.name}</div>
                          <span style={{ ...mono, fontSize:9, color:inkFaint }}>↺ flip</span>
                        </div>
                        <div style={{ height:1, background:"rgba(0,0,0,0.12)", marginBottom:11 }}/>
                        <div style={{ marginBottom:10 }}>
                          <div style={{ ...mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, marginBottom:7 }}>PROS</div>
                          {card.pros.map((p,j)=>(
                            <div key={j} style={{ fontSize:11, marginBottom:5, display:"flex", gap:7, alignItems:"flex-start", lineHeight:1.45 }}>
                              <span style={{ ...mono, color:"rgba(0,0,0,0.35)", flexShrink:0, fontWeight:600 }}>[+]</span>
                              <span style={{ color:"rgba(0,0,0,0.72)" }}>{p}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ height:1, background:"rgba(0,0,0,0.12)", marginBottom:11 }}/>
                        <div style={{ flex:1, overflow:"auto" }}>
                          <div style={{ ...mono, fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:inkFaint, marginBottom:7 }}>CONS</div>
                          {card.cons.map((p,j)=>(
                            <div key={j} style={{ fontSize:11, marginBottom:5, display:"flex", gap:7, alignItems:"flex-start", lineHeight:1.45 }}>
                              <span style={{ ...mono, color:"rgba(0,0,0,0.35)", flexShrink:0, fontWeight:600 }}>[–]</span>
                              <span style={{ color:"rgba(0,0,0,0.72)" }}>{p}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ position:"absolute", right:10, top:"50%", writingMode:"vertical-rl", transform:"translateY(-50%) rotate(180deg)", ...mono, fontSize:8, fontWeight:700, letterSpacing:"0.22em", color:"rgba(0,0,0,0.14)", whiteSpace:"nowrap", pointerEvents:"none" }}>{card.sub.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ width:280, borderLeft:`1px solid ${border}`, overflowY:"auto", paddingBottom:80, flexShrink:0 }}>
            <div style={{ padding:"16px 16px 8px", ...mono, fontSize:11, color:textDim, letterSpacing:"0.1em", display:"flex", justifyContent:"space-between" }}>
              <span>SELECTION</span><span style={{ color:lime }}>{selected.size}</span>
            </div>
            {selected.size===0 ? (
              <div style={{ padding:16, fontSize:13, color:textDim }}>Click cards to select components.</div>
            ) : (
              <>
                {Object.entries(GROUPS).map(([gk,g])=>{
                  const gc = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk);
                  if (!gc.length) return null;
                  return (
                    <div key={gk} style={{ padding:"8px 16px" }}>
                      <div style={{ ...mono, fontSize:10, color:g.color, letterSpacing:"0.15em", marginBottom:4 }}>{g.label}</div>
                      {gc.map(c=>(
                        <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0" }}>
                          <span style={{ fontSize:12 }}>{c.name}</span>
                          <button style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:14, padding:"0 4px" }} onClick={()=>toggle(c.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div style={{ padding:"12px 16px" }}>
                  <button style={s.btnPrimary} onClick={()=>setView("canvas")}>View on Canvas →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ANALYSIS VIEW
      ══════════════════════════════════════════════════ */}
      {view === "analysis" && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:32 }}>
            <div>
              <div style={{ ...mono, fontSize:11, color:lime, letterSpacing:"0.15em", marginBottom:4 }}>ANALYSIS</div>
              <input value={projectName} onChange={e=>setProjectName(e.target.value)}
                style={{ fontFamily:"'Instrument Serif',serif", fontSize:36, fontWeight:400, fontStyle:"italic", background:"transparent", border:"none", color:text, outline:"none", width:"100%" }}
              />
            </div>
            <span style={{ ...mono, fontSize:13, color:textDim }}>{selected.size} components</span>
          </div>

          {selected.size===0 ? (
            <div style={s.panel}><p style={{ color:textDim }}>No components selected. <button style={{ color:lime, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }} onClick={()=>setView("home")}>Return to entry</button> or <button style={{ color:lime, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }} onClick={()=>setView("canvas")}>open canvas</button>.</p></div>
          ) : (
            <>
              {activeArchetype && (
                <div style={{ ...s.panel, borderColor:lime }}>
                  <div style={{ ...mono, fontSize:11, color:lime, letterSpacing:"0.1em", marginBottom:8 }}>EXPERIENCE CHARACTER — {activeArchetype.name}</div>
                  <div style={{ fontSize:15, lineHeight:1.7, color:textDim }}>{activeArchetype.character}</div>
                </div>
              )}
              <div style={s.panel}>
                <div style={{ ...mono, fontSize:11, color:textDim, letterSpacing:"0.1em", marginBottom:16 }}>COMPONENT MAP</div>
                {Object.entries(GROUPS).map(([gk,g])=>{
                  const gc = selectedCards.filter(c=>CATEGORIES[c.cat]?.group===gk);
                  if (!gc.length) return null;
                  return (
                    <div key={gk} style={{ marginBottom:16 }}>
                      <div style={{ ...mono, fontSize:10, color:g.color, letterSpacing:"0.15em", marginBottom:8 }}>{g.label}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {gc.map(c=>(
                          <span key={c.id} style={{ padding:"6px 12px", borderRadius:6, background:CATEGORIES[c.cat]?.color+"15", border:`1px solid ${CATEGORIES[c.cat]?.color}44`, fontSize:12, fontWeight:500 }}>{c.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={s.panel}>
                <div style={{ ...mono, fontSize:11, color:textDim, letterSpacing:"0.1em", marginBottom:16 }}>IMPLICATIONS</div>
                {selectedCards.map(card=>(
                  <div key={card.id} style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${border}`, display:"flex", gap:16 }}>
                    <div style={{ width:3, borderRadius:2, background:CATEGORIES[card.cat]?.color||"#888", flexShrink:0 }}/>
                    <div>
                      <div style={{ ...mono, fontSize:9, color:CATEGORIES[card.cat]?.color, letterSpacing:"0.1em", marginBottom:4 }}>{card.sub.toUpperCase()} — {card.name}</div>
                      <div style={{ fontSize:13, color:textDim, lineHeight:1.65 }}>{card.implication}</div>
                    </div>
                  </div>
                ))}
              </div>
              {analysis.gaps.length>0 && (
                <div style={{ ...s.panel, borderColor:"#F90" }}>
                  <div style={{ ...mono, fontSize:11, color:"#F90", letterSpacing:"0.1em", marginBottom:16 }}>⚠ DEPENDENCY GAPS — {analysis.gaps.length} issues</div>
                  {analysis.gaps.map((g,i)=>(
                    <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:i<analysis.gaps.length-1?`1px solid ${border}`:"none" }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{g.trigger}</div>
                      <div style={{ fontSize:13, color:textDim, marginBottom:6 }}>{g.msg}</div>
                      <div style={{ display:"flex", gap:6 }}>
                        {g.needIds.map(nid=>{ const nc=CARDS.find(c=>c.id===nid); return nc?(<button key={nid} onClick={()=>toggle(nid)} style={{ ...mono, fontSize:11, padding:"4px 10px", borderRadius:4, border:"1px solid #F90", background:"transparent", color:"#F90", cursor:"pointer" }}>+ Add {nc.name}</button>):null; })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {analysis.gaps.length===0 && (
                <div style={{ ...s.panel, borderColor:lime }}>
                  <div style={{ ...mono, fontSize:11, color:lime, letterSpacing:"0.1em", marginBottom:8 }}>✓ ALL DEPENDENCIES MET</div>
                  <div style={{ fontSize:14, color:textDim }}>Your combination is technically viable. All required dependencies are covered.</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PROFILES VIEW
      ══════════════════════════════════════════════════ */}
      {view === "profiles" && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ ...mono, fontSize:11, color:lime, letterSpacing:"0.15em", marginBottom:8 }}>EXAMPLE PROFILES</div>
          <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, fontWeight:400, fontStyle:"italic", marginBottom:8 }}>Learn from real combinations</h2>
          <p style={{ fontSize:14, color:textDim, marginBottom:32 }}>Load a profile to explore how components work together in real product concepts.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {PROFILES.map((p,i)=>(
              <div key={i} style={{ ...s.panel, borderTop:`2px solid ${p.color}` }}>
                <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{p.name}</div>
                <div style={{ fontSize:12, color:textDim, marginBottom:12, lineHeight:1.6 }}>{p.desc}</div>
                <div style={{ ...mono, fontSize:11, color:textDim, marginBottom:12 }}>{p.cards.length} components</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:16 }}>
                  {p.cards.slice(0,8).map(cid=>{ const c=CARDS.find(x=>x.id===cid); return c?(<span key={cid} style={{ padding:"2px 8px", borderRadius:4, fontSize:10, background:surface, border:`1px solid ${border}`, ...mono }}>{c.name}</span>):null; })}
                  {p.cards.length>8 && <span style={{ padding:"2px 8px", fontSize:10, color:textDim, ...mono }}>+{p.cards.length-8} more</span>}
                </div>
                <button style={s.btnPrimary} onClick={()=>loadProfile(p)}>Load on Canvas →</button>
              </div>
            ))}
          </div>
          <div style={{ ...s.panel, borderStyle:"dashed" }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Start from scratch</div>
            <div style={{ fontSize:13, color:textDim, marginBottom:12 }}>Choose an experience character or describe your product to begin.</div>
            <button style={s.btnSecondary} onClick={()=>setView("home")}>Go to entry →</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        *::-webkit-scrollbar { width:5px }
        *::-webkit-scrollbar-track { background:#0B0B0B }
        *::-webkit-scrollbar-thumb { background:#2A2A2A; border-radius:3px }
        input::placeholder { color:#888 }
        pre { margin:0 }
        button { font-family:inherit }
      `}</style>
    </div>
  );
}
