import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Html, Line } from '@react-three/drei';
import { Box, Chip, CircularProgress, Fade, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { useBuilder } from '../../context/BuilderContext';
import { deviceTypes, builderCategories, getOptionsForDevice } from '../../data/builderData';

const ACCENT = '#00C8FF';

/*
 * Real GLB product models (Draco-compressed) served from /models/.
 * Each form factor loads its own asset; hover highlights the device
 * and shows its bilingual name. The GLBs are single merged meshes so
 * per-part raycast picking isn't possible — instead, clickable 3D
 * hotspot markers (one per component category) float around the model
 * and open the same config panel used by the blueprint view.
 */
/*
 * targetSize: desired largest dimension in scene units. Each GLB has a
 * different native scale, so models are normalized to this size at load.
 * Monocular at 2.45 is the visual reference; the others match it.
 */
const MODELS = {
  monocular: { url: '/models/monocular.glb', targetSize: 2.45, camera: [2.2, 1.2, 2.8] },
  binocular: { url: '/models/binocular.glb', targetSize: 2.45, camera: [2.4, 1.3, 3.0] },
  panoramic: { url: '/models/panoramic.glb', targetSize: 2.8, camera: [2.4, 1.3, 3.0] },
};

// Schematic-style callouts per component category and device type.
// `anchor` sits on (or just off) the model surface at the part it represents;
// `label` is the outer end of the leader line where the pill is rendered.
// Both are in the model's rotating group, so callouts stay attached while spinning.
const HOTSPOTS = {
  monocular: {
    housing: { anchor: [0, 0.35, 0], label: [-1.5, 1.1, 0] },
    tube: { anchor: [0.3, 0, 0.1], label: [1.7, 0.15, 0.3] },
    objective: { anchor: [0, -0.05, 0.85], label: [0.9, -0.7, 1.5] },
    eyepiece: { anchor: [0, -0.05, -0.85], label: [0.9, -0.7, -1.5] },
    battery: { anchor: [-0.35, 0.25, -0.2], label: [-1.6, -0.4, -0.5] },
    mount: { anchor: [0, 0.6, -0.25], label: [0, 1.5, -0.9] },
    illuminator: { anchor: [0.25, 0.4, 0.55], label: [1.3, 1.2, 1.1] },
  },
  binocular: {
    housing: { anchor: [0, 0.4, 0], label: [0, 1.5, 0.6] },
    tube: { anchor: [0.5, 0, 0.1], label: [1.8, 0.2, 0.3] },
    objective: { anchor: [0.4, -0.05, 0.85], label: [1.3, -0.7, 1.5] },
    eyepiece: { anchor: [0.4, -0.05, -0.8], label: [1.3, -0.7, -1.5] },
    battery: { anchor: [-0.5, 0.3, -0.1], label: [-1.8, -0.3, -0.4] },
    mount: { anchor: [0, 0.65, -0.25], label: [-1.2, 1.5, -0.7] },
    illuminator: { anchor: [-0.3, 0.4, 0.6], label: [-1.4, 1.2, 1.2] },
  },
  panoramic: {
    housing: { anchor: [0, 0.4, 0], label: [0, 1.6, 0.6] },
    tube: { anchor: [0.7, 0, 0.25], label: [2.0, 0.25, 0.5] },
    objective: { anchor: [0.5, -0.1, 0.85], label: [1.4, -0.8, 1.5] },
    eyepiece: { anchor: [0.3, -0.05, -0.8], label: [1.2, -0.7, -1.5] },
    battery: { anchor: [-0.7, 0.3, -0.1], label: [-2.0, -0.3, -0.4] },
    mount: { anchor: [0, 0.7, -0.25], label: [-1.3, 1.6, -0.7] },
    illuminator: { anchor: [-0.4, 0.4, 0.65], label: [-1.5, 1.3, 1.2] },
  },
};

Object.values(MODELS).forEach((m) => useGLTF.preload(m.url));

function DeviceModel({ url, targetSize, hovered, onPointerOver, onPointerOut }) {
  const { scene } = useGLTF(url);

  // Clone so highlight edits don't leak into the GLTF cache
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Normalize to a consistent on-screen size regardless of native GLB scale
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? targetSize / maxDim : 1;
  }, [cloned, targetSize]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.origEmissive) {
          child.userData.origEmissive = child.material.emissive?.clone() ?? new THREE.Color(0x000000);
          child.material = child.material.clone();
          // Some exports have single-sided faces which look hollow from outside
          child.material.side = THREE.DoubleSide;
          // Force opaque rendering — some exports flag materials as
          // transparent (or carry texture alpha), making the body see-through
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.alphaMap = null;
          child.material.depthWrite = true;
        }
        child.material.emissive.set(hovered ? ACCENT : child.userData.origEmissive);
        child.material.emissiveIntensity = hovered ? 0.12 : 1;
      }
    });
  }, [cloned, hovered]);

  return (
    <Center>
      <primitive
        object={cloned}
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onPointerOut();
          document.body.style.cursor = 'auto';
        }}
      />
    </Center>
  );
}

/* Slow idle rotation, paused while inspecting -------------------------- */
function IdleSpin({ paused, children }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.15;
  });
  return <group ref={ref}>{children}</group>;
}

/* On mobile / touch we give up the idle spin entirely and let the user
   rotate the device themselves via OrbitControls. Rendering a plain group
   avoids running the per-frame rotation work at all. -------------------- */
function StaticGroup({ children }) {
  return <group>{children}</group>;
}

/* Schematic-style callout: anchor dot on the part, 3D leader line to an
   outer label pill. Everything lives in the rotating group, so the line
   and label never detach from their target while the model spins. ------ */
function Hotspot({ anchor, labelPos, label, selected, active, onClick }) {
  const [hover, setHover] = useState(false);
  const highlighted = hover || active;

  return (
    <group>
      {/* Leader line drawn in 3D from part anchor to label endpoint */}
      <Line
        points={[anchor, labelPos]}
        color={ACCENT}
        lineWidth={highlighted ? 2 : 1.2}
        transparent
        opacity={highlighted ? 0.95 : 0.55}
        depthTest={false}
      />

      {/* Anchor dot sitting on the component itself */}
      <mesh position={anchor} renderOrder={2}>
        <sphereGeometry args={[highlighted ? 0.045 : 0.032, 16, 16]} />
        <meshBasicMaterial
          color={selected ? ACCENT : '#ffffff'}
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>

      {/* Endpoint knob — a real 3D sphere so it sits exactly on the line end */}
      <mesh
        position={labelPos}
        renderOrder={2}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[highlighted ? 0.075 : 0.06, 16, 16]} />
        <meshBasicMaterial
          color={selected ? ACCENT : '#06222e'}
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>
      {/* Knob outline ring */}
      <mesh position={labelPos} renderOrder={2}>
        <sphereGeometry args={[highlighted ? 0.085 : 0.07, 16, 16]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={highlighted ? 0.55 : 0.35}
          depthTest={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Label pill — only while hovered or the category panel is open */}
      {highlighted && (
        <Html position={labelPos} center distanceFactor={6} zIndexRange={[10, 0]}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              px: 1.4,
              py: 0.45,
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Roboto, Noto Sans Hebrew, sans-serif',
              letterSpacing: 0.3,
              color: '#fff',
              bgcolor: 'rgba(0, 60, 85, 0.92)',
              border: `1px solid ${ACCENT}`,
              boxShadow: `0 0 14px rgba(0,200,255,0.55)`,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
            }}
          >
            {label}
            {selected && (
              <Box
                component="span"
                sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ACCENT, flexShrink: 0 }}
              />
            )}
          </Box>
        </Html>
      )}
    </group>
  );
}

/* Main exported component ---------------------------------------------- */
export default function Device3D() {
  const { deviceType, selections, activeCategory, setActiveCategory } = useBuilder();
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();
  // Auto-rotation makes hotspots a moving target that is hard to tap accurately
  // on touch screens, so disable the idle spin on mobile / coarse pointers.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const disableIdleSpin = isMobile || isCoarsePointer;

  const model = MODELS[deviceType] ?? MODELS.monocular;
  const deviceInfo = deviceTypes.find((d) => d.id === deviceType);
  const hoveredLabel =
    hovered && deviceInfo ? t({ he: deviceInfo.nameHe, en: deviceInfo.nameEn }) : null;

  const hotspotPositions = HOTSPOTS[deviceType] ?? HOTSPOTS.monocular;
  const hotspotCategories = builderCategories.filter(
    (c) => hotspotPositions[c.id] && getOptionsForDevice(c, deviceType).length > 0
  );

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 320, md: 480 },
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(0,200,255,0.15)',
        background:
          'radial-gradient(ellipse at center, rgba(0,200,255,0.06) 0%, rgba(11,11,11,1) 70%)',
        direction: 'ltr',
      }}
    >
      {/* Hovered device name overlay */}
      <Fade in={Boolean(hoveredLabel)}>
        <Chip
          label={hoveredLabel ?? ''}
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            bgcolor: 'rgba(0, 20, 30, 0.85)',
            color: ACCENT,
            border: `1px solid ${ACCENT}`,
            fontWeight: 600,
            letterSpacing: 1,
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        />
      </Fade>

      <Suspense
        fallback={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        }
      >
        <Canvas key={deviceType} camera={{ position: model.camera, fov: 42 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} />
          <directionalLight position={[-4, 2, -3]} intensity={0.35} color={ACCENT} />
          {(() => {
            const ModelGroup = disableIdleSpin ? StaticGroup : IdleSpin;
            return (
              <ModelGroup paused={hovered || Boolean(activeCategory)}>
                <DeviceModel
                  url={model.url}
                  targetSize={model.targetSize}
                  hovered={hovered}
                  onPointerOver={() => setHovered(true)}
                  onPointerOut={() => setHovered(false)}
                />
                {hotspotCategories.map((category) => (
                  <Hotspot
                    key={category.id}
                    anchor={hotspotPositions[category.id].anchor}
                    labelPos={hotspotPositions[category.id].label}
                    label={t({ he: category.nameHe, en: category.nameEn })}
                    selected={Boolean(selections[category.id])}
                    active={activeCategory === category.id}
                    onClick={() =>
                      setActiveCategory(activeCategory === category.id ? null : category.id)
                    }
                  />
                ))}
              </ModelGroup>
            );
          })()}
          <ContactShadows position={[0, -1.1, 0]} opacity={0.5} blur={2.4} scale={9} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            maxPolarAngle={Math.PI * 0.85}
          />
        </Canvas>
      </Suspense>
    </Box>
  );
}
