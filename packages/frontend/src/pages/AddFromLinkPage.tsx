import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductData } from '@wishlist/shared';
import { ExternalLink, Check, AlertCircle } from '../components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { ItemForm } from '../components/wishlist/ItemForm';
import { toast } from 'sonner';
import { Loader2 } from '../components/icons';
import { useWishlist } from '../contexts/WishlistContext';
import { SUPPORTED_CURRENCIES } from '../lib/validations';

// Helper to validate currency code
function isValidCurrency(
  currency: string | null | undefined
): currency is (typeof SUPPORTED_CURRENCIES)[number] {
  if (!currency) return false;
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(currency);
}

// Type guard for ProductData
function isProductData(data: unknown): data is ProductData {
  if (!data || typeof data !== 'object') return false;

  const pd = data as Record<string, unknown>;

  return (
    typeof pd.isProduct === 'boolean' &&
    typeof pd.confidence === 'number' &&
    (pd.title === null || typeof pd.title === 'string') &&
    (pd.description === null || typeof pd.description === 'string') &&
    (pd.reason === undefined || typeof pd.reason === 'string')
  );
}

export default function AddFromLinkPage() {
  const navigate = useNavigate();
  const { createItem } = useWishlist();
  const isMountedRef = useRef(true);

  const [link, setLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup effect to track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!link.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Validate URL
    try {
      new URL(link);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: link }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to analyze link');
      }

      const result = await response.json();

      // Validate response structure
      if (!result.data || !isProductData(result.data)) {
        throw new Error('Invalid response format from server');
      }

      // Guard state updates with mount check
      if (!isMountedRef.current) return;

      if (!result.data.isProduct) {
        // Don't show form for non-product links
        const errorMessage = 'This link is not a product page.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Only set analysis result and show form for product pages
        setAnalysisResult(result.data);
        toast.success('Product details extracted successfully!');
      }
    } catch (err) {
      // Guard state updates with mount check
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze link';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      // Guard state updates with mount check
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleCreateItem = async (data: {
    title: string;
    description?: string;
    url?: string;
    price?: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const success = await createItem(data);
    if (success) {
      navigate('/');
    }
    return success;
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setLink('');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-2xl py-6 md:py-8">
        <BackButton />

        {/* Stage 1: URL Input Form */}
        {!analysisResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                <CardTitle>Add Item from Link</CardTitle>
              </div>
              <CardDescription>
                Paste a product link to automatically extract details using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://example.com/product"
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isAnalyzing}
                  className="w-full"
                />
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-900">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                    <div>{error}</div>
                  </div>
                )}
                <Button type="submit" disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Link'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stage 2: Review & Edit Form */}
        {analysisResult && (
          <div className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 p-4 text-sm text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>{error}</div>
              </div>
            )}

            {/* Success Alert */}
            {analysisResult.isProduct && !error && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-50 p-4 text-sm text-green-900">
                <Check className="h-4 w-4 text-green-600" />
                <div>Product details extracted! Review and edit before saving.</div>
              </div>
            )}

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Review Item Details</CardTitle>
                <CardDescription>Edit the details below and save to your wishlist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ItemForm
                  defaultValues={{
                    title: analysisResult.title || '',
                    description: analysisResult.description || '',
                    url: link,
                    priceAmount: analysisResult.priceAmount || '',
                    priceCurrency: isValidCurrency(analysisResult.priceCurrency)
                      ? analysisResult.priceCurrency
                      : '',
                    priority: 'medium',
                  }}
                  onSubmit={handleCreateItem}
                  submitLabel="Add to Wishlist"
                />
                <Button variant="outline" onClick={handleReset} className="w-full">
                  Try Different Link
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
