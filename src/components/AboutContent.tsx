import React, { useState, useEffect } from "react";

interface AboutContentProps {
  subcategory: string;
}

// Function to format image filename for display (similar to Gallery component)
const formatImageName = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // Replace hyphens and underscores with spaces
  return nameWithoutExt.replace(/[-_]/g, " ");
};

export function AboutContent({ subcategory }: AboutContentProps) {
  // For skills and programs, we'll fetch "images" from the known list
  const [skills, setSkills] = useState<string[]>([]);
  const [programs, setPrograms] = useState<{ name: string, image: string }[]>([]);
  const [socials, setSocials] = useState<{ link: string, name: string, image: string }[]>([]);
  
  // Function to load skills and programs data
  useEffect(() => {
    // This mimics the functionality in Gallery.tsx fetchActualImages
    const knownImages: Record<string, Record<string, string[]>> = {
      'about-me': {
        'about': ['profile.jpg', 'bio.txt', 'introduction.png'],
        'skills': [
          '2D_Digital_Art_and_Illustration.png',
          'Character_Design.png',
          'Concept_Design.png',
          'Pixel_Art.png',
          '2D_Digital_Animation.png',
          '3D_Modeling.png',
          '3D_Animation.png',
          '2D_Bone_Animation.png',
          '2D_Rigging.png',
          '2D_Traditional_Animation.png',
          'Pixel_Animation.png',
          '3D_Hand_Painting_and_Texturing.png',
          'Traditional_Art.png',
          'Storyboarding.png',
          'UI_Design.png'
        ],
        'programs': [
          'Adobe_Photoshop.png',
          'Clip_Studio_Paint.png',
          'Blender.png',
          'Adobe_After_Effects.png',
          'Adobe_Animate.png',
          'Adobe_Flash.png',
          'Aseprite.png',
          'Live2D_Cubism.png',
          'Unity.png'
        ],
        'work-experience': ['resume.pdf', 'portfolio.jpg', 'achievements.png'],
        'socials': ['Itch_Io.png', 'YouTube_Inactive.png', 'X_Twitter_Inactive.png', 'Github_Inactive.png', 'Instagram_Active.png', 'linkedin.png'],
        'contact': ['email.png', 'discord.png', 'form.png']
      }
    };
    
    // Set skills with name and image properties
    setSkills(knownImages['about-me']['skills'] || []);
    
    // Create program objects with name and image properties
    setPrograms((knownImages['about-me']['programs'] || []).map(image => ({
      name: formatImageName(image),
      image: image
    })));

    // Create social media objects with link, name and image properties
    setSocials((knownImages['about-me']['socials'] || []).map(image => {
      const name = formatImageName(image);
      const platform = name.toLowerCase();
      return {
        link: `https://${platform}.com/username`,
        name: name,
        image: image
      };
    }));
  }, []);
  
  const renderContent = () => {
    switch (subcategory) {
      case "about":
        return (
          <div className="flex flex-col items-center p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4">ABOUT ME</h2>
            <p className="text-center mb-6 max-w-md">
              Hello! I'm a passionate digital artist specializing in multiple art styles and mediums.
              With a background in both traditional and digital art, I create everything from illustrations 
              to 3D models and animations.
            </p>
            
            <div className="mb-6">
              <img 
                src="/images/about-me/about/profile.jpg" 
                alt="Profile" 
                className="w-48 h-48 object-cover border-4 border-[#6D6DD0]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-48 h-48 flex items-center justify-center bg-[#000000] border-2 border-[#6D6DD0]">
                      <p class="text-sm text-center p-2">Profile Image Placeholder</p>
                    </div>
                  `;
                }}
              />
            </div>
            
            <p className="text-center max-w-md">
              My art journey began when I was young, and I've since developed my skills across multiple
              disciplines. I'm constantly exploring new techniques and pushing my creative boundaries.
              Feel free to explore my portfolio to see my range of work!
            </p>
          </div>
        );
        
      case "skills":
        return (
          <div className="p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4 text-center">MY SKILLS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skills.map((skill, index) => (
                <div 
                  key={index}
                  className="p-2 flex flex-col items-center"
                >
                  <div className="w-16 h-16 mb-1 flex items-center justify-center">
                    <img 
                      src={`/images/about-me/skills/${skill}`} 
                      alt={formatImageName(skill)}
                      className="max-w-full max-h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-16 h-16 flex items-center justify-center bg-[#000000]">
                            <p class="text-xs text-center">${formatImageName(skill)}</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span>{formatImageName(skill)}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case "programs":
        return (
          <div className="p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4 text-center">PROGRAMS I USE</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {programs.map((program, index) => (
                <div 
                  key={index}
                  className="p-2 flex flex-col items-center"
                >
                  <div className="w-16 h-16 mb-1 flex items-center justify-center">
                    <img 
                      src={`/images/about-me/programs/${program.image}`} 
                      alt={program.name}
                      className="max-w-full max-h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-16 h-16 flex items-center justify-center bg-[#000000]">
                            <p class="text-xs text-center">${program.name}</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span>{program.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case "work-experience":
        return (
          <div className="p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4 text-center">MY WORK EXPERIENCE</h2>
            {[
              {
                company: "Creative Studio X",
                position: "Senior Digital Artist",
                period: "2020 - Present",
                description: "Lead artist for various client projects including character design, concept art, and promotional materials."
              },
              {
                company: "Game Developer Y",
                position: "Character Artist",
                period: "2018 - 2020",
                description: "Designed and created game characters, environments, and assets for multiple game projects."
              },
              {
                company: "Animation Studio Z",
                position: "Illustrator & Animator",
                period: "2016 - 2018",
                description: "Collaborated on animated short films, created storyboards, and designed characters."
              }
            ].map((job, index) => (
              <div 
                key={index}
                className="mb-6 border-2 border-[#6D6DD0] p-4"
              >
                <h3 className="text-lg font-bold">{job.company}</h3>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{job.position}</span>
                  <span>{job.period}</span>
                </div>
                <p>{job.description}</p>
              </div>
            ))}
          </div>
        );
        
      case "socials":
        return (
          <div className="p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4 text-center">MY SOCIALS</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { name: "YouTube (i)", link: "https://www.youtube.com/@Lillulette/", icon: "YouTube_Inactive.png" },
                { name: "X / Twitter (i)", link: "https://x.com/lillulette/", icon: "X_Twitter_Inactive.png" },
                { name: "Itch.io", link: "https://lillulette.itch.io/", icon: "Itch_Io.png" },
                { name: "GitHub", link: "https://github.com/lidyagercek/", icon: "GitHub_Inactive.png" },
                { name: "Art Instagram (i)", link: "https://instagram.com/lillulette/", icon: "Instagram_Inactive.png" },
                { name: "Tattoo Instagram", link: "https://instagram.com/lillulettoo/", icon: "Instagram_Active.png" }
              ].map((social, index) => (
                <a 
                  key={index} 
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 flex flex-col items-center"
                >
                  <div className="w-16 h-16 mb-1 flex items-center justify-center">
                    <img 
                      src={`/images/about-me/socials/${social.icon}`} 
                      alt={social.name}
                      className="max-w-full max-h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-16 h-16 flex items-center justify-center bg-[#16164D] rounded-full">
                            <span class="text-center text-lg">${social.name.charAt(0)}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        );
        
      case "contact":
        return (
          <div className="p-6 text-[#6D6DD0] overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-6 text-center">SEND ME A MESSAGE!</h2>
            
            <form 
              className="max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const email = formData.get('email') as string;
                const subject = formData.get('subject') as string;
                const message = formData.get('message') as string;
                
                // In a real app, you would send this data to your server or email service
                console.log('Form submitted:', { name, email, subject, message });
                
                // For demonstration purposes, show an alert
                alert(`Thank you, ${name}! Your message has been sent.`);
                
                // Reset the form
                e.currentTarget.reset();
              }}
            >
              <div className="mb-4">
                <label htmlFor="name" className="block mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-[#000000] border-2 border-[#6D6DD0] p-2 text-[#6D6DD0] focus:outline-none focus:ring-2 focus:ring-[#8080ED]"
                  placeholder="Your Name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-[#000000] border-2 border-[#6D6DD0] p-2 text-[#6D6DD0] focus:outline-none focus:ring-2 focus:ring-[#8080ED]"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full bg-[#000000] border-2 border-[#6D6DD0] p-2 text-[#6D6DD0] focus:outline-none focus:ring-2 focus:ring-[#8080ED]"
                  placeholder="Message Subject"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full bg-[#000000] border-2 border-[#6D6DD0] p-2 text-[#6D6DD0] focus:outline-none focus:ring-2 focus:ring-[#8080ED]"
                  placeholder="Your message..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#6D6DD0] text-[#000000] p-2 font-bold hover:bg-[#8080ED] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full text-[#6D6DD0]">
            <p>Select a category to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
} 