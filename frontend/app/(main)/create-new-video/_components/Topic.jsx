'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2Icon, Edit2Icon, SaveIcon, XIcon } from 'lucide-react';
import axios from 'axios';
import { useAuthContext } from '@/app/providers';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react';

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
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const [AudienceType, setAudienceType] = useState(null);
  const [PurposeType, setPurposeType] = useState(null);
  const [editingScriptIndex, setEditingScriptIndex] = useState(null);
  const [editedScript, setEditedScript] = useState('');
  const [tabMode, setTabMode] = useState('suggestion');
  const [sources, setSources] = useState([]);

  // Function to generate the script dynamically
  const GenerateScript = async () => {
    if (!selectedTopic || !AudienceType || !PurposeType) return;
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

  const generateFromCrawl = async () => {
    if (!selectedTopic || !AudienceType || !PurposeType) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/crawl-and-summarize', {
        topic: selectedTopic,
        audience: AudienceType,
        purpose: PurposeType,
      });

      const { script, sources } = res.data;
      setScripts([{ content: script }]);
      setSources(sources);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tabMode === 'suggestion') {
      GenerateScript();
    }
  }, [selectedTopic, AudienceType, PurposeType, tabMode]);

  const handleEditScript = (index, content) => {
    setEditingScriptIndex(index);
    setEditedScript(content);
  };

  const handleSaveEdit = (index) => {
    const updatedScripts = [...scripts];
    updatedScripts[index].content = editedScript;
    setScripts(updatedScripts);
    setEditingScriptIndex(null);
    if (selectedScriptIndex === index) {
      onHandleInputChange('script', editedScript);
    }
  };

  const handleCancelEdit = () => {
    setEditingScriptIndex(null);
    setEditedScript('');
  };

  return (
    <div>
      <div className="mt-5">
        <h2>Video Topic</h2>
        <p className="text-sm text-gray-600">Select topic for your video</p>

        <Tabs
          defaultValue="suggestion"
          className="w-full mt-2"
          onValueChange={(value) => setTabMode(value)}
        >
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
      {tabMode === 'your_topic' && (
        <Button
          className="mt-5"
          onClick={() => {
            if (selectedTopic && AudienceType && PurposeType) {
              generateFromCrawl();
            } else {
              toast('Please select topic, audience and purpose!');
            }
          }}
        >
          Generate Script
        </Button>
      )}

      {/* Script Selection */}
      {scripts?.length > 0 && (
        <div className="mt-5">
          <h2>Select the Script</h2>
          <div className="grid grid-cols-2 gap-5 mt-1">
            {scripts.map((item, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg relative min-h-[120px] ${
                  selectedScriptIndex === index ? 'border-white bg-secondary' : ''
                }`}
              >
                {editingScriptIndex === index ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedScript}
                      onChange={(e) => setEditedScript(e.target.value)}
                      className="w-full"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(index)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <SaveIcon className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <XIcon className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="cursor-pointer pr-10"
                      onClick={() => {
                        setSelectedScriptIndex(index);
                        onHandleInputChange('script', item?.content);
                      }}
                    >
                      <h2 className="line-clamp-4 text-sm text-gray-300">{item.content}</h2>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-3 right-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditScript(index, item.content);
                      }}
                    >
                      <Edit2Icon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sources?.length > 0 && tabMode === 'your_topic' && (
        <div className="mt-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-white bg-opacity-90">
            <h3 className="text-xl font-medium text-gray-800 flex items-center">
              <span className="mr-2">Sources</span>
              <span className="text-sm text-gray-500 font-normal">({sources.length})</span>
            </h3>
          </div>

          <div className="p-5">
            <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {sources.map((url, idx) => (
                <li key={idx} className="group">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start p-3 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm"
                  >
                    <ExternalLink size={18} className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-blue-600 line-clamp-2 break-all">
                      {url}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="mt-3 flex items-center">
          <Loader2Icon className="animate-spin mr-2" />
          <span>Generating script...</span>
        </div>
      )}
    </div>
  );
}

Topic.propTypes = {
  onHandleInputChange: PropTypes.func.isRequired,
};

export default Topic;
