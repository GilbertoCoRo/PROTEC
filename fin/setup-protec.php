<?php

echo "🚀 Creando estructura PROTEC 3D...\n";

// Crear carpetas
$dirs = [
    "protec-3d/app/components",
    "protec-3d/app/lib"
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
        echo "📁 Carpeta creada: $dir\n";
    }
}

// Supabase client
file_put_contents("protec-3d/app/lib/supabaseClient.ts", "
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
");

// Scene 3D
file_put_contents("protec-3d/app/components/Scene3D.tsx", "
'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Sphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color='#00E5FF' emissive='#00E5FF' />
    </mesh>
  )
}

export default function Scene3D() {
  return (
    <div className='absolute inset-0 -z-10'>
      <Canvas>
        <ambientLight />
        <Sphere />
        <OrbitControls autoRotate />
      </Canvas>
    </div>
  )
}
");

// Hero
file_put_contents("protec-3d/app/components/Hero.tsx", "
'use client'
import Scene3D from './Scene3D'

export default function Hero() {
  return (
    <section className='h-screen flex items-center justify-center text-white relative'>
      <Scene3D />
      <h1 className='text-5xl font-bold z-10'>PROTEC 3D</h1>
    </section>
  )
}
");

// Catalog
file_put_contents("protec-3d/app/components/Catalog3D.tsx", "
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Catalog3D() {
  const [data, setData] = useState([])

  useEffect(() => {
    supabase.from('INVENTARIO').select('*').then(res => setData(res.data || []))
  }, [])

  return (
    <div className='grid md:grid-cols-3 gap-6 p-10'>
      {data.map((p, i) => (
        <div key={i} className='bg-white/10 p-5 rounded-xl'>
          <h3>{p.nombre_equipo}</h3>
          <p>{p.marca}</p>
          <p>${p.precio}</p>
        </div>
      ))}
    </div>
  )
}
");

// Footer
file_put_contents("protec-3d/app/components/Footer.tsx", "
export default function Footer() {
  return (
    <footer className='bg-[#020C1B] text-white p-10 grid md:grid-cols-4'>
      <div>PROTEC</div>
      <div>Servicios</div>
      <div>Empresa</div>
      <div>Contacto</div>
    </footer>
  )
}
");

// Page
file_put_contents("protec-3d/app/page.tsx", "
import Hero from './components/Hero'
import Catalog3D from './components/Catalog3D'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className='bg-[#0A192F] min-h-screen'>
      <Hero />
      <Catalog3D />
      <Footer />
    </main>
  )
}
");

// ENV
file_put_contents("protec-3d/.env.local", "
NEXT_PUBLIC_SUPABASE_URL=TU_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_KEY
");

echo "✅ Archivos generados correctamente.\n";
echo "👉 Ahora ejecuta manualmente:\n";
echo "npx create-next-app@latest protec-3d --tailwind --app\n";
echo "y reemplaza los archivos generados.\n";