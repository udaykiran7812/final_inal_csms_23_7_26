import React from 'react';

interface PandaAvatarProps {
  focusState: 'email' | 'password' | 'normal';
}

export const PandaAvatar: React.FC<PandaAvatarProps> = ({ focusState }) => {
  // Eye positions based on focus
  const eyeLStyle =
    focusState === 'email'
      ? { left: '0.75em', top: '1.12em' }
      : { left: '0.6em', top: '0.6em' };

  const eyeRStyle =
    focusState === 'email'
      ? { right: '0.75em', top: '1.12em' }
      : { right: '0.6em', top: '0.6em' };

  // Hand positions covering eyes during password input
  const handLStyle =
    focusState === 'password'
      ? {
          height: '5.8em',
          top: '1.2em',
          left: '2.5em',
          transform: 'rotate(-155deg)',
        }
      : {
          height: '2.81em',
          top: '5.4em',
          left: '0.6em',
          transform: 'rotate(0deg)',
        };

  const handRStyle =
    focusState === 'password'
      ? {
          height: '5.8em',
          top: '1.2em',
          right: '2.5em',
          transform: 'rotate(155deg)',
        }
      : {
          height: '2.81em',
          top: '5.4em',
          right: '0.6em',
          transform: 'rotate(0deg)',
        };

  return (
    <div className="relative w-36 h-28 mx-auto mb-3 select-none flex justify-center items-center">
      <div className="relative w-[8.4em] h-[7.5em] scale-90 sm:scale-100 transition-transform duration-300">
        {/* Ears */}
        <div className="absolute -top-2 -left-2 w-[2.81em] h-[2.5em] bg-[#3f3554] border-[0.18em] border-[#2e0d30] rounded-t-[2.5em] -rotate-[38deg]" />
        <div className="absolute -top-2 -right-2 w-[2.81em] h-[2.5em] bg-[#3f3554] border-[0.18em] border-[#2e0d30] rounded-t-[2.5em] rotate-[38deg]" />

        {/* Face */}
        <div className="relative w-[8.4em] h-[7.5em] bg-white border-[0.18em] border-[#2e0d30] rounded-t-[7.5em] rounded-b-[5.62em] shadow-lg overflow-visible">
          {/* Blush */}
          <div className="absolute top-[4em] left-[1em] w-[1.37em] h-[1em] bg-[#ff8bb1] rounded-full rotate-[25deg]" />
          <div className="absolute top-[4em] right-[1em] w-[1.37em] h-[1em] bg-[#ff8bb1] rounded-full -rotate-[25deg]" />

          {/* Left Eye */}
          <div className="absolute top-[2.18em] left-[1.37em] w-[2em] h-[2.18em] bg-[#3f3554] rounded-[2em] -rotate-[20deg] overflow-hidden">
            <div
              className="absolute w-[0.6em] h-[0.6em] bg-white rounded-full transition-all duration-300 ease-out rotate-[20deg]"
              style={eyeLStyle}
            />
          </div>

          {/* Right Eye */}
          <div className="absolute top-[2.18em] right-[1.37em] w-[2em] h-[2.18em] bg-[#3f3554] rounded-[2em] rotate-[20deg] overflow-hidden">
            <div
              className="absolute w-[0.6em] h-[0.6em] bg-white rounded-full transition-all duration-300 ease-out -rotate-[20deg]"
              style={eyeRStyle}
            />
          </div>

          {/* Nose */}
          <div className="absolute top-[4.37em] left-1/2 -translate-x-1/2 w-[1em] h-[1em] bg-[#3f3554] rounded-tr-[1.2em] rounded-bl-[0.25em] rotate-45">
            <div className="absolute top-[0.75em] left-[1em] w-[0.1em] h-[0.6em] bg-[#3f3554] -rotate-45" />
          </div>

          {/* Mouth */}
          <div className="absolute top-[5.31em] left-[3.12em] w-[0.93em] h-[0.75em] rounded-full shadow-[0_0.18em_#3f3554]">
            <div className="absolute left-[0.87em] w-[0.93em] h-[0.75em] rounded-full shadow-[0_0.18em_#3f3554]" />
          </div>

          {/* Animated Hands */}
          <div
            className="absolute w-[2.5em] bg-[#3f3554] border-[0.18em] border-[#2e0d30] rounded-t-[0.6em] rounded-b-[2.18em] transition-all duration-500 ease-in-out z-20"
            style={handLStyle}
          />
          <div
            className="absolute w-[2.5em] bg-[#3f3554] border-[0.18em] border-[#2e0d30] rounded-t-[0.6em] rounded-b-[2.18em] transition-all duration-500 ease-in-out z-20"
            style={handRStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default PandaAvatar;
