# Error of Webpack

1. 
Question:  
Vue CLI 3.x upgrade to Vue CLI 4.x, <code>import(\`@/lang/${local}\`)</code> warning problem, and the relative module can't import directly  
`warning: Critical dependency: the request of a dependency is an expression`

Solution:  
use <code>await Promise.resolve(require(\`@/lang/${locale}\`))</code> instead of <code>await import(\`@/lang/${local}\`)</code>
