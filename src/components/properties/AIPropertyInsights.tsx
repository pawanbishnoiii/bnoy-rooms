
import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSystemSetting } from '@/utils/settingsService';
import { Wand2, ArrowRight, Lightbulb, Star, Clock, Trophy, ThumbsUp } from 'lucide-react';

const AIPropertyInsights = ({ property }: { property: Property }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await getSystemSetting('GOOGLE_AI_API_KEY');
        if (key) {
          setApiKey(key);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };
    
    loadApiKey();
  }, []);
  
  useEffect(() => {
    // If property has AI insights already, use them
    if (property.ai_strengths && property.ai_strengths.length > 0) {
      setStrengths(property.ai_strengths);
    }
  }, [property]);

  const generateInsights = async () => {
    if (!apiKey) {
      setInsights(['API key not configured. Please contact administrator.']);
      return;
    }
    
    setLoading(true);
    try {
      // In a real implementation, we'd call a Google AI API endpoint
      // For now, let's simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock insights based on property attributes
      const propertyInsights = [
        `This ${property.type} property offers excellent value with ${property.capacity} total capacity.`,
        `The location is convenient for students attending nearby educational institutions.`,
        `${property.gender === 'boys' ? 'Specifically designed for male students.' : 
           property.gender === 'girls' ? 'Specially catered to female students.' : 
           'Accommodates all genders in a comfortable environment.'}`,
        `Amenities include ${property.facilities?.slice(0, 3).map(f => f.name).join(', ')} and more.`
      ];
      
      setInsights(propertyInsights);
      
      // Generate mock strengths
      const propertyStrengths = [
        'Good value for money',
        'Convenient location',
        'Well-maintained facilities',
        'Responsive management',
        'Clean environment'
      ];
      
      setStrengths(propertyStrengths);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights(['Failed to generate insights. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-1">AI Property Analysis</h2>
          <p className="text-muted-foreground">Get AI-powered insights about this property</p>
        </div>
        
        {!insights.length && (
          <Button onClick={generateInsights} disabled={loading}>
            {loading ? (
              <>Analyzing<span className="animate-pulse">...</span></>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        )}
      </div>
      
      {!insights.length && !loading ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/70" />
            <h3 className="font-medium mb-1">No insights generated yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button above to analyze this property with AI and get personalized insights.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center">
            <div className="animate-pulse inline-block">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Analyzing property data</h3>
            <p className="text-sm text-muted-foreground">
              Our AI is evaluating this property based on multiple factors...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" /> 
                Property Strengths
              </CardTitle>
              <CardDescription>
                Key positive aspects of this property according to our analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {strengths.map((strength, i) => (
                  <Badge key={i} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    <ThumbsUp className="h-3 w-3 mr-1" /> {strength}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" /> 
                Detailed Analysis
              </CardTitle>
              <CardDescription>
                AI-generated insights about this property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start">
                  <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                  <p>{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIPropertyInsights;
