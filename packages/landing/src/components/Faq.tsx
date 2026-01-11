import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Faq() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    
    return (
          <section className="py-20 md:py-32 bg-white" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Wish Master
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* FAQ 1 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">How does the AI description generation work?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 0 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Our AI analyzes the product link you provide and automatically extracts key information like the product name, 
                    description, price, and images. It then creates a beautifully formatted wish card with all the essential details, 
                    saving you time and ensuring consistency across your wishlist.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">Which online stores are supported?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 1 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Wish Master works with virtually any online store! We support major retailers like Amazon, eBay, Etsy, Target, 
                    Walmart, and thousands more. Simply paste any product URL and our AI will do the rest. If you encounter any 
                    issues with a specific site, please let us know.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">Is my wishlist private?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 2 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Yes! Your wishlist is completely private by default. You have full control over who can see your wishes. 
                    You can choose to share your entire wishlist or specific items with friends and family via a secure link. 
                    Only people with the link can view your shared wishes.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">How do I share my wishlist?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 3 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Sharing is super easy! Just click the "Share" button on your wishlist, and you'll get a unique link that you 
                    can send to anyone. You can share via email, text message, social media, or any other way you prefer. 
                    Recipients can view your wishlist without needing to create an account.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">Is Wish Master free to use?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 4 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 4 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Yes! Wish Master is completely free to use. You can create unlimited wishlists, add as many items as you want, 
                    and share with unlimited people. We may offer premium features in the future, but the core functionality 
                    will always remain free. No credit card required to get started!
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg text-gray-900">Can I edit or delete wishes after adding them?</span>
                <ChevronDown className={`size-5 text-gray-600 transition-transform ${openFaqIndex === 5 ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === 5 && (
                <div className="px-6 pb-5 text-gray-600">
                  <p>
                    Absolutely! You have full control over your wishes. You can edit the AI-generated descriptions, add notes, 
                    change priorities, or delete wishes at any time. The AI provides a great starting point, but you can always 
                    customize everything to match your preferences.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
}