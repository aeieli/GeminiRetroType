import React from 'react';

interface MachineProps {
    paper: React.ReactNode;
    keyboard: React.ReactNode;
    isTyping?: boolean;
}

export const TypewriterMachine: React.FC<MachineProps> = ({ paper, keyboard, isTyping }) => {
  return (
    <div className="relative flex flex-col items-center justify-end w-full max-w-[900px] mx-auto h-full pointer-events-none">
        
        {/* --- PLATEN (ROLLER) ASSEMBLY --- */}
        
        {/* 1. Paper Slot (Behind the Roller) */}
        <div className="absolute top-[100px] w-full flex justify-center z-0">
             {paper}
        </div>

        {/* 2. The Platen (Roller) - Visual Only - Z-INDEX UPDATED to cover paper bottom if needed, but text must be visible */}
        {/* Actually, on real typewriter, paper wraps around. For this 2D view, paper comes 'up' from behind. 
            So Paper Z < Roller Z is correct for the bottom part, but text is typed ON TOP of the roller. 
            Ideally, we need the text to be Z > Roller, but the paper body Z < Roller. 
            That's hard to split. 
            Simplification: Paper is Z-0. Roller is Z-10. 
            If Paper is 'behind' the roller, the text typed at the bottom might be hidden.
            We moved the paper UP in Paper.tsx, so the typing line should now be ABOVE the roller's center axis.
        */}
        <div className="relative z-10 w-[600px] h-28 mt-auto translate-y-12 flex items-center justify-center">
             {/* Roller Axis */}
             <div className="w-[640px] h-4 bg-zinc-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
             
             {/* Main Black Roller */}
             <div className="relative w-[580px] h-24 bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border-t border-zinc-700 ring-1 ring-black">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#18181b,#18181b_2px,#09090b_3px)] opacity-80"></div>
                <div className="absolute top-2 left-0 w-full h-6 bg-white/10 blur-md rounded-full"></div>
             </div>

             {/* Roller Knobs */}
             <div className="absolute left-[-40px] w-10 h-20 bg-zinc-800 rounded-l-md border-r border-zinc-950 shadow-xl flex items-center justify-center">
                <div className="w-2 h-16 bg-zinc-950 rounded-full"></div>
             </div>
             <div className="absolute right-[-40px] w-10 h-20 bg-zinc-800 rounded-r-md border-l border-zinc-950 shadow-xl flex items-center justify-center">
                <div className="w-2 h-16 bg-zinc-950 rounded-full"></div>
             </div>
        </div>

        {/* --- TYPE GUIDE & POINTER (Fixed Center) --- */}
        <div className="relative z-20 w-full flex justify-center h-0">
            <div className="absolute bottom-4 flex flex-col items-center">
                
                {/* The Hammer Action */}
                <div className={`
                    w-2 h-10 bg-zinc-400/80 shadow-lg origin-bottom transition-transform duration-50 ease-out
                    ${isTyping ? 'scale-y-100 translate-y-0 opacity-100' : 'scale-y-50 translate-y-4 opacity-0'}
                `}></div>

                {/* The Type Guide (V-Shape) */}
                <div className="relative">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-zinc-300 drop-shadow-md"></div>
                    {/* Red Marker line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[10px] bg-red-600/80"></div>
                </div>

                {/* The Scale Bar */}
                <div className="w-[540px] h-6 bg-gradient-to-b from-zinc-100 to-zinc-300 mt-[-2px] rounded-sm shadow-md flex items-end justify-between px-4 border border-zinc-400 relative overflow-hidden">
                    {/* Ruler markings */}
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className={`w-[1px] bg-zinc-600 ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`}></div>
                    ))}
                    {/* Red Triangle Pointer on Scale */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"></div>
                </div>
            </div>
        </div>

        {/* --- MAIN BODY HOUSING (Silver) --- */}
        <div className="relative z-30 w-full pointer-events-auto flex justify-center">
            <div 
                className="w-[850px] min-h-[340px] rounded-t-[4rem] rounded-b-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.5)] relative bg-noise border-t border-white/40"
                style={{
                    background: 'linear-gradient(160deg, #e4e4e7 0%, #d4d4d8 40%, #a1a1aa 100%)', // Zinc 200 -> 300 -> 400
                }}
            >
                {/* Chrome Trim */}
                <div className="absolute top-12 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50"></div>

                {/* Brand Badge */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black px-5 py-1 rounded shadow-md border border-zinc-500">
                    <span className="text-zinc-200 font-['Special_Elite'] tracking-[0.3em] text-xs font-bold uppercase drop-shadow-sm">
                        SILVER STRIKE
                    </span>
                </div>

                {/* Vents */}
                <div className="absolute top-24 left-16 w-20 h-20 flex flex-col gap-2 opacity-30">
                     {[1,2,3].map(i => <div key={i} className="w-full h-1.5 bg-black rounded-full shadow-inner"></div>)}
                </div>
                <div className="absolute top-24 right-16 w-20 h-20 flex flex-col gap-2 opacity-30">
                     {[1,2,3].map(i => <div key={i} className="w-full h-1.5 bg-black rounded-full shadow-inner"></div>)}
                </div>

                {/* Keyboard Well - Recessed Area */}
                <div className="mt-16 bg-[#1a1a1a] rounded-[2.5rem] p-6 shadow-[inset_0_10px_30px_rgba(0,0,0,0.9)] border-b border-white/10 relative overflow-hidden">
                     <div className="absolute inset-0 bg-noise opacity-10"></div>
                     {keyboard}
                </div>
            </div>
            
            {/* Desk Shadow under the machine */}
            <div className="absolute -bottom-4 left-[10%] w-[80%] h-16 bg-black/70 blur-3xl rounded-[50%] -z-10"></div>
        </div>
    </div>
  );
};