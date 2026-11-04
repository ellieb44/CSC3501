const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./browser-tests',
 fullyParallel:false,
 workers:1,
 timeout:30000,
 use:{browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,
  viewport:{width:1280,height:900},reducedMotion:'reduce'},
 reporter:'list'
});
