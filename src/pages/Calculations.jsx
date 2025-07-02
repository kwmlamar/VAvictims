import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertTriangle, Sigma, CheckCircle } from 'lucide-react';

const Calculations = () => {
  return (
    <>
      <Helmet>
        <title>Scoring Methodology - VA Accountability Platform</title>
        <meta name="description" content="Explanation of the grading and formula used for scoring VA facilities, VISNs, and national performance." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-white"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            Scoring Methodology
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Our approach to grading is designed to enforce accountability and drive improvement.
          </p>
        </div>

        <div className="space-y-8">
          <motion.div whileHover={{ y: -5 }} className="ios-card p-8">
            <h2 className="flex items-center text-3xl font-bold text-white mb-4">
              <AlertTriangle className="h-8 w-8 mr-3 text-amber-400" />
              Grading Explanation
            </h2>
            <div className="space-y-6 text-blue-100 text-lg leading-relaxed">
              <div>
                <h3 className="font-semibold text-xl text-white mb-2">Failure-Based Scoring</h3>
                <p>
                  The performance score is failure-based. While the VA may manipulate data for a positive public image, our system focuses on the data they often cover up. The goal is to compel the VA to address poor performance and rights violations, ensuring they strive to bring veterans the best possible care rather than protecting individuals and entities involved in misconduct.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white mb-2">Data Integrity</h3>
                <p>
                  If a VA facility, VISN, or national body is found to use perjuries, fraud, witness tampering, or other obstructive techniques, their data is deemed untrustworthy. Regardless of their claims, the public needs to know when data is based on dishonesty.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="ios-card p-8">
            <h2 className="flex items-center text-3xl font-bold text-white mb-4">
              <Sigma className="h-8 w-8 mr-3 text-teal-400" />
              Formula Explanation
            </h2>
            <div className="space-y-6 text-blue-100 text-lg leading-relaxed">
              <div>
                <h3 className="font-semibold text-xl text-white mb-2">National & VISN Score</h3>
                <p className="font-mono bg-gray-800/50 p-4 rounded-lg text-teal-300">
                  (Average of the lowest 50% of facility scores + The single lowest facility score) / 3
                </p>
                <p className="mt-2">
                  This formula is designed to heavily weigh the performance of the worst-performing facilities, preventing high scores from masking significant failures within the network.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white mb-2">Facility & Local Score (CBOCs, etc.)</h3>
                <p>
                  Each negative data point—such as repeated findings, patient safety issues, continued violations, or other infractions—is additively counted. This creates a cumulative performance score that directly reflects the volume of issues, forcing the VA to fix problems rather than conceal them.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Calculations;