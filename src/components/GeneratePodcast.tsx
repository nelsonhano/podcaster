import { toast, useToast } from "@/components/ui/use-toast"
import React, { useState } from 'react'

import { GeneratePodcastProps } from '../../types/index'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { useAction, useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import { useUploadFiles } from "@xixixao/uploadstuff/react";


const useGeneratePodcast = ({ setAudio, voiceType, voicePrompt, setAudioStorageId }: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateUploadUrl = useMutation(api.file.generateUploadUrl);

  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getPodcastAudio = useAction(api.openai.generateAudioAction);
  const getAudioUrl = useMutation(api.podcast.getUrl)

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio('');

    if (!voicePrompt) {
      toast({
        title: "Please provide a voicType to generate a podcast",
      });
      return setIsGenerating(false);
    }
      
    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt
      })

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false); 
      toast({
        title: "Podcast generated successfully",
      })
    } catch (error) {
      console.log('Error generating podcast', error);
      toast({
        title: "Error creating a podcast",
        variant: 'destructive'
      })
      setIsGenerating(false)
    }
  }
  return {
    isGenerating, generatePodcast
  }
}

export default function GeneratePodcast(props: GeneratePodcastProps) {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);

  return (
    <div>
      <div className='flex flex-col gap-2.5'>
        <label className='text-16 font-bold text-white-1'>
          AI Prompt to generate Podcast
        </label>
        <Textarea
          className='input-class font-light focus-visible:ring-offset-orange-1'
          placeholder='Provide text to generte audio'
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className='mt-5 max-w-[200px]'>
        <Button type="submit"
          className="bg-orange-1 w-full py-4 font-boldtext-white-1" onClick={generatePodcast}>
          {isGenerating ? (
            <>
              Generting...
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            'Generte'
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className='mt-5'
          onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  )
}
