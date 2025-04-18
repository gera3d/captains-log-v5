// ...existing imports...
-import AuthButton from './contexts/AuthContext';
+import AuthButton from './components/AuthButton';
 import FeaturesSection from './components/FeaturesSection';
+import TestimonialsSection from './components/TestimonialsSection';

 function LandingPage() {
   return (
     <div className="bg-gradient-primary text-primary-text">
@@
       </main>
+      {/* Features */}
+      <FeaturesSection />
+      {/* Testimonials / logos */}
+      <TestimonialsSection />
     </div>
   );
 }