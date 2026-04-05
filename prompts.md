Help me build out a weather web app using the Google Weather Frog art. I've already downloaded the art myself, and now I need you to help me build out the following:
- a weather API setup and a traditional weather forecast display
- Set up a display component for the Weather Frog art and having it controlled via the weather API results
- a basic site around the weather components with a header, footer, and an About page

I want you to do some research on the Google Weather Frog and its art. There appears to be a few Github projects out there that you can reference. Each "piece" of art seems to consist of combinations of 3 background, midground, and foreground images.

---

Image Optimization: I want you to take the `frog-images-src` folder and use Sharp to optimize/compress/resize the images, and save the results in a new folder named `frog-images-optimized`.

---

UPDATE: art-preview page 

CONTEXT: we're building a weather app that uses artwork tied to the weather conditions, so we can only view the art that cooreponds to the current weather, and we can't preview other art for other conditions

REQUEST: set up a new page that shows a slider gallery of all the available image options for the different weather conditions. My intention for this is to give us an easy way to preview all of the frog art images regardless of the current weather.

EXTRAS: 
- I want to install and use Swiper.js for the slider gallery
- I want you to use DRY coding principles and set up separate reusable components whenever possible, to keep our project easy to edit and manage.
- Try to keep files limited to 300-400 lines of code. If a file goes over this size, consider breaking it up into smaller components.
- I want you to spawn 5 Haiku subagents to work in parallel to speed up dev time.
- I want you to use a todo list, and I want you to assign each subagent a set of tasks to work on in parallel to maximize efficiency. 