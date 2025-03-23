import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, MapPin, Star, AlertCircle, RefreshCw } from 'lucide-react';

interface AIPropertyInsightsProps {
  property: Property;
}

const AIPropertyInsights: React.FC<AIPropertyInsightsProps> = ({ property }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'GOOGLE_AI_API_KEY')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching Google AI API key:', error);
        setError('Unable to load AI insights due to a configuration error.');
        return;
      }
      
      if (data?.value) {
        setApiKey(data.value);
      }
    };
    
    fetchApiKey();
  }, []);

  const generateInsights = async () => {
    if (!apiKey) {
      setError('AI insights are not available at the moment. Please try again later.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const propertyData = {
        name: property.name,
        type: property.type,
        category: property.category,
        gender: property.gender,
        address: property.address,
        location: property.location?.name || '',
        price: property.monthly_price,
        facilities: property.facilities?.map((f: any) => f.name).join(', ') || '',
        description: property.description || '',
      };
      
      const prompt = `
        Analyze this property for students looking for accommodation:
        Property: ${propertyData.name}
        Type: ${propertyData.type}
        Category: ${propertyData.category}
        Gender: ${propertyData.gender}
        Location: ${propertyData.address}, ${propertyData.location}
        Price: ₹${propertyData.price} per month
        Facilities: ${propertyData.facilities}
        Description: ${propertyData.description}
        
        Provide insights on:
        1. Is this good value for money compared to typical market rates?
        2. What type of students would this accommodation suit best?
        3. What are the potential advantages of this location?
        4. What are some things to be aware of before booking?
        5. Any recommendations for students considering this property?
        
        Format the response with clear headings and bullet points where appropriate.
      `;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      setInsights(generatedText);
    } catch (error: any) {
      console.error('Error generating AI insights:', error);
      setError('Failed to generate AI insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">AI Property Insights</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Get AI-powered insights about this property to help you make an informed decision.
        Our AI analyzes the property details, location, pricing, and amenities to provide useful recommendations.
      </p>
      
      {!insights && !isLoading && !error && (
        <Button onClick={generateInsights} className="mt-2">
          Generate AI Insights
        </Button>
      )}
      
      {isLoading && (
        <Card className="border border-muted bg-muted/30">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium">Analyzing property details...</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Our AI is reviewing this property to generate personalized insights.
            </p>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border border-destructive/20 bg-destructive/10">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-center font-medium">Error generating insights</p>
            <p className="text-sm text-muted-foreground text-center mt-2">{error}</p>
            <Button onClick={generateInsights} className="mt-4" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {insights && !isLoading && (
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: insights.replace(/\n/g, '<br />') 
              }} />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateInsights}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPropertyInsights;
