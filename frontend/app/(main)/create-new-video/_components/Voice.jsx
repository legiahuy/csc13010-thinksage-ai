import React from 'react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import PropTypes from 'prop-types';

const voiceOptions = [
  {
    value: 'am_liam',
    name: '🇺🇸 Liam (Male)',
  },
  {
    value: 'am_michael',
    name: '🇺🇸 Michael (Male)',
  },
  {
    value: 'am_onyx',
    name: '🇺🇸 Onyx (Male)',
  },
  {
    value: 'am_fenrir',
    name: '🇺🇸 Fenrir (Male)',
  },
  {
    value: 'am_eric',
    name: '🇺🇸 Eric (Male)',
  },
  {
    value: 'am_echo',
    name: '🇺🇸 Echo (Male)',
  },
  {
    value: 'hm_psi',
    name: '🇮🇳 Psi (Male)',
  },
  {
    value: 'hm_omega',
    name: '🇮🇳 Omega (Male)',
  },
  {
    value: 'hf_beta',
    name: '🇮🇳 Beta (Female)',
  },
  {
    value: 'am_adam',
    name: '🇺🇸 Adam (Male)',
  },
  {
    value: 'af_sky',
    name: '🇺🇸 Sky (Female)',
  },
  {
    value: 'af_sarah',
    name: '🇺🇸 Sarah (Female)',
  },
];
function Voice({ onHandleInputChange }) {
  const [selectedVoice, setSelectedVoice] = useState();
  return (
    <div className="mt-5">
      <h2>Video Voice</h2>
      <p className="text-sm text-gray-400">Select voice for your video</p>
      <ScrollArea className="h-[200px] w-full">
        <div className="grid grid-cols-2 gap-3">
          {voiceOptions.map((voice, index) => (
            <h2
              className={`cursor-pointer p-3 dark:bg-slate-900 dark:border-white rounded-lg hover:boarder ${voice.name == selectedVoice && 'border'}`}
              onClick={() => {
                setSelectedVoice(voice.name);
                onHandleInputChange('voice', voice.value);
              }}
              key={index}
            >
              {voice.name}
            </h2>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

Voice.propTypes = {
  onHandleInputChange: PropTypes.func.isRequired,
};

export default Voice;
