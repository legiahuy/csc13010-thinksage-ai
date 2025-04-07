'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SparklesIcon, Loader2Icon } from 'lucide-react';
import axios from 'axios';
import { useAuthContext } from '@/app/providers';

const suggestions = [
  'Historic Story',
  'Kids Story',
  'Movie Stories',
  'AI Innovations',
  'Space Mysteries',
  'Horror Stories',
  'Mythological Tales',
  'Tech Breakthroughs',
  'True Crime Stories',
  'Fantasy Adventures',
  'Science Experiments',
  'Motivational Stories',
];

const Audience = ['Kids', 'Teens', 'Adults', 'Seniors'];
const Purpose = ['Informative', 'Educational', 'Entertainment', 'Motivational'];

function Topic({ onHandleInputChange }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(null);
  const [scripts, setScripts] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const [AudienceType, setAudienceType] = useState(null);
  const [PurposeType, setPurposeType] = useState(null);

  // Function to generate the script dynamically
  const GenerateScript = async () => {
    if (!selectedTopic || !AudienceType || !PurposeType) return; // Ensure all fields are selected
    if (user?.credits <= 0) {
      toast('Please add more credits!');
      return;
    }

    setLoading(true);
    setSelectedScriptIndex(null);
    try {
      const result = await axios.post('/api/generate-script', {
        topic: selectedTopic,
        audience: AudienceType,
        purpose: PurposeType,
      });

      setScripts(result.data?.scripts || []);
    } catch (error) {
      console.error('Error generating script:', error);
    }
    setLoading(false);
  };

  // Automatically call GenerateScript whenever topic, audience, or purpose changes
  useEffect(() => {
    GenerateScript();
  }, [selectedTopic, AudienceType, PurposeType]); // Dependencies trigger the function

  return (
    <div>
      <h2 className="mb-1">Project Title</h2>
      <Input
        placeholder="Enter Project Title"
        onChange={(event) => onHandleInputChange('title', event?.target.value)}
      />

      <div className="mt-5">
        <h2>Video Topic</h2>
        <p className="text-sm text-gray-600">Select topic for your video</p>

        <Tabs defaultValue="suggestion" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="your_topic">Your Topic</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div>
              {suggestions.map((suggestion, index) => (
                <Button
                  variant="outline"
                  key={index}
                  className={`m-1 ${suggestion === selectedTopic ? 'bg-secondary' : ''}`}
                  onClick={() => {
                    setSelectedTopic(suggestion);
                    onHandleInputChange('topic', suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
              <h2>Enter your own topic</h2>
              <Textarea
                placeholder="Enter your topic"
                onChange={(event) => {
                  setSelectedTopic(event.target.value);
                  onHandleInputChange('topic', event.target.value);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Audience Selection */}
      <div className="mt-5">
        <h2>Audience</h2>
        <p className="text-sm text-gray-600">Select the target audience</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Audience.map((aud, idx) => (
            <Button
              key={idx}
              variant="outline"
              className={AudienceType === aud ? 'bg-secondary' : ''}
              onClick={() => {
                setAudienceType(aud);
                onHandleInputChange('audience', aud);
              }}
            >
              {aud}
            </Button>
          ))}
        </div>
      </div>

      {/* Purpose Selection */}
      <div className="mt-5">
        <h2>Purpose</h2>
        <p className="text-sm text-gray-600">What is the purpose of this video?</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Purpose.map((p, idx) => (
            <Button
              key={idx}
              variant="outline"
              className={PurposeType === p ? 'bg-secondary' : ''}
              onClick={() => {
                setPurposeType(p);
                onHandleInputChange('purpose', p);
              }}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Script Selection */}
      {scripts?.length > 0 && (
        <div className="mt-5">
          <h2>Select the Script</h2>
          <div className="grid grid-cols-2 gap-5 mt-1">
            {scripts.map((item, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedScriptIndex === index ? 'border-white bg-secondary' : ''
                }`}
                onClick={() => {
                  setSelectedScriptIndex(index);
                  onHandleInputChange('script', item?.content);
                }}
              >
                <h2 className="line-clamp-4 text-sm text-gray-300">
                  {item.content}
                </h2>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="mt-3 flex items-center">
          <Loader2Icon className="animate-spin mr-2" />
          <span>Regenerating script...</span>
        </div>
      )}
    </div>
  );
}

export default Topic;
