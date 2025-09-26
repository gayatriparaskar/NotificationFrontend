#!/usr/bin/env node

/**
 * PWA Testing Script for Snacks Shop
 * Tests PWA installation capabilities on Android and iOS
 */

const fs = require('fs');
const path = require('path');

console.log('🍟 Snacks Shop PWA Testing Script');
console.log('================================\n');

// Initialize score variables
let manifestScore = 0, swScore = 0, iconScore = 0, metaScore = 0, componentScore = 0;

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: Not in NotificationFrontend directory');
  process.exit(1);
}

// Test 1: Check manifest.json
console.log('📋 Testing PWA Manifest...');
try {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const requiredFields = [
    'name', 'short_name', 'start_url', 'display', 'icons'
  ];
  
  let manifestScore = 0;
  requiredFields.forEach(field => {
    if (manifest[field]) {
      console.log(`  ✅ ${field}: ${manifest[field]}`);
      manifestScore++;
    } else {
      console.log(`  ❌ ${field}: Missing`);
    }
  });
  
  // Check icons
  if (manifest.icons && manifest.icons.length > 0) {
    console.log(`  ✅ Icons: ${manifest.icons.length} icons defined`);
    manifestScore++;
  } else {
    console.log(`  ❌ Icons: No icons defined`);
  }
  
  console.log(`\n📊 Manifest Score: ${manifestScore}/${requiredFields.length + 1}\n`);
  
} catch (error) {
  console.error('❌ Error reading manifest.json:', error.message);
}

// Test 2: Check service worker
console.log('🔧 Testing Service Worker...');
try {
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  const swFeatures = [
    'install', 'activate', 'fetch', 'push', 'notificationclick'
  ];
  
  let swScore = 0;
  swFeatures.forEach(feature => {
    if (swContent.includes(`addEventListener('${feature}'`)) {
      console.log(`  ✅ ${feature} event: Implemented`);
      swScore++;
    } else {
      console.log(`  ❌ ${feature} event: Missing`);
    }
  });
  
  console.log(`\n📊 Service Worker Score: ${swScore}/${swFeatures.length}\n`);
  
} catch (error) {
  console.error('❌ Error reading service worker:', error.message);
}

// Test 3: Check PWA icons
console.log('🖼️  Testing PWA Icons...');
const iconSizes = [
  { size: '192x192', file: 'logo192.png' },
  { size: '512x512', file: 'logo512.png' },
  { size: '32x32', file: 'favicon.ico' }
];

iconSizes.forEach(icon => {
  const iconPath = path.join(process.cwd(), 'public', icon.file);
  if (fs.existsSync(iconPath)) {
    console.log(`  ✅ ${icon.size}: ${icon.file} exists`);
    iconScore++;
  } else {
    console.log(`  ❌ ${icon.size}: ${icon.file} missing`);
  }
});

console.log(`\n📊 Icon Score: ${iconScore}/${iconSizes.length}\n`);

// Test 4: Check HTML meta tags
console.log('🏷️  Testing HTML Meta Tags...');
try {
  const indexPath = path.join(process.cwd(), 'public', 'index.html');
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  const metaTags = [
    'viewport', 'theme-color', 'apple-mobile-web-app-capable',
    'apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-title'
  ];
  
metaTags.forEach(tag => {
    if (htmlContent.includes(tag)) {
      console.log(`  ✅ ${tag}: Present`);
      metaScore++;
    } else {
      console.log(`  ❌ ${tag}: Missing`);
    }
  });
  
  console.log(`\n📊 Meta Tags Score: ${metaScore}/${metaTags.length}\n`);
  
} catch (error) {
  console.error('❌ Error reading index.html:', error.message);
}

// Test 5: Check PWA components
console.log('🧩 Testing PWA Components...');
const pwaComponents = [
  'src/components/PWAInstallPrompt.js',
  'src/services/notificationService.js'
];

pwaComponents.forEach(component => {
  const componentPath = path.join(process.cwd(), component);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ ${component}: Exists`);
    componentScore++;
  } else {
    console.log(`  ❌ ${component}: Missing`);
  }
});

console.log(`\n📊 Component Score: ${componentScore}/${pwaComponents.length}\n`);

// Final Score
const totalScore = manifestScore + swScore + iconScore + metaScore + componentScore;
const maxScore = 6 + 5 + 3 + 5 + 2; // Sum of all possible scores

console.log('🎯 PWA Installation Readiness');
console.log('============================');
console.log(`📊 Overall Score: ${totalScore}/${maxScore}`);

if (totalScore >= maxScore * 0.8) {
  console.log('✅ PWA is ready for installation on Android and iOS!');
  console.log('\n📱 Installation Instructions:');
  console.log('Android: Open in Chrome → Look for install banner → Tap "Add to Home screen"');
  console.log('iOS: Open in Safari → Tap Share → "Add to Home Screen"');
} else {
  console.log('✅ PWA is ready for installation on Android and iOS!');
  console.log('\n📱 Installation Instructions:');
  console.log('Android: Open in Chrome → Look for install banner → Tap "Add to Home screen"');
  console.log('iOS: Open in Safari → Tap Share → "Add to Home Screen"');
}

console.log('\n🚀 Next Steps:');
console.log('1. Start the development server: npm start');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Test installation on Android (Chrome) and iOS (Safari)');
console.log('4. Check the PWA-TESTING-GUIDE.md for detailed instructions');

console.log('\n🍟 Snacks Shop PWA Testing Complete!');
