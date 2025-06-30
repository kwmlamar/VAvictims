import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Eye } from 'lucide-react';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - VA Accountability Platform</title>
        <meta name="description" content="Learn about the mission and vision of the VA Accountability Platform, dedicated to transparency and reform in veteran care." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-white"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            About Our Mission
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Driving Transparency and Accountability in Veteran Affairs
          </p>
        </div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div whileHover={{ y: -5 }} className="ios-card p-6">
              <ShieldCheck className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Empowerment</h2>
              <p className="text-blue-200">
                To empower veterans, their families, and advocates with unbiased, data-driven insights into the performance of VA facilities nationwide.
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="ios-card p-6">
              <Eye className="h-12 w-12 mx-auto text-teal-400 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Transparency</h2>
              <p className="text-blue-200">
                To bring radical transparency to the Department of Veterans Affairs by aggregating and analyzing public data, user complaints, and official reports.
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="ios-card p-6">
              <Target className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Accountability</h2>
              <p className="text-blue-200">
                To highlight systemic issues, hold leadership accountable, and drive meaningful reform for the betterment of all veteran care.
              </p>
            </motion.div>
          </div>

          <div className="ios-card p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              We envision a future where every veteran receives the highest standard of care and respect they have earned. This platform was born from the necessity to create an independent, unblemished source of truth regarding VA performance. We believe that by shining a light on both failures and successes, we can create a system that is responsive, just, and truly serves those who have served our country. Our work is dedicated to ensuring that the promises made to our veterans are kept, and that their voices are never silenced.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default About;