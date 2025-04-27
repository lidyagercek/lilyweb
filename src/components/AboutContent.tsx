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
            I am a versatile (mostly) 2D artist with Far Eastern and Anime aesthetics, both in digital and traditional works, following the trends of the said inspirations. I also can do 3D modelling and pixel art, with a little bit of knowledge in the software part.
            </p>
            
            <div className="mb-6">
              <img 
                src="/images/about-me/about/profile.png" 
                alt="Profile" 
                className="w-48 h-48 object-cover border-4 border-[#6D6DD0]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-50 h-50 flex items-center justify-center bg-[#000000] border-2 border-[#6D6DD0]">
                      <p class="text-sm text-center p-2">Profile Image Placeholder</p>
                    </div>
                  `;
                }}
              />
            </div>
            
            <p className="text-center max-w-md">
  My career in the game industry started when I was 17. My first job experience was at a mobile FPS game studio, where I got to learn more about the jobs in the game industry.  
  <br /><br />
  I designed UIs and placed them in Unity, created social media posts, reskinned UIs and social media accounts for specific events, worked on illustrations using Photoshop, bug tested our game before the QA team, managed the reviews of our game while taking notes of bugs and issues with a priority list, and even acted as a support agent for some players.
  <br /><br />
  Then I took a break and got into Istanbul Aydin University as a Cartoon & Animation student by getting a full scholarship on the talent exam. I studied and practiced to better my skills.  
  <br /><br />
  During that time I learned Live2D on the side and started doing commissions, where I made over 25 VTuber models and a few animations with dynamic physics and high motion range.  
  <br /><br />
  When the internship term started, I worked on Cultic Games' game <i>"Cats and the Other Lives"</i> as a pixel artist / animator using Aseprite. In the next internship term, I modeled assets in Blender for a hotel’s realistic room preview job at a small studio in my university's incubation center.  
  <br /><br />
  As for my graduation project, I made a copy of the game <i>"Vampire Survivors"</i> with my own assets and code using Aseprite and Unity.
  <br /><br />
  In 2022, I started working at a startup indie game company that made hypercasual mobile games. It was a role I got through a strong recommendation from one of my teachers.  
  <br /><br />
  I used Blender to make low-poly models for the hypercasual games and hand-painted them for a unique stylized look. I also did UI design and Live2D animations there for some of our games.
  <br /><br />
  I took Japanese classes for 2 years during this time. Therefore, I speak Turkish, English and a little bit of Japanese.
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
                company: "Project Flying Cat",
                position: "Artist",
                period: "Jan 2022 - Jul 2022",
                description: (
                  <>
                    <p>■ Modeled, hand textured, and animated optimized low to mid poly 3D models for mobile hypercasual games using Blender and Adobe Photoshop.</p>
                    <p>■ Designed, illustrated, and animated 2D characters using Adobe Photoshop and Live2D Cubism.</p>
                    <p>■ Designed and created UI assets using Adobe Photoshop.</p>
                  </>
                )
              },
              {
                company: "Cultic Games",
                position: "Intern Artist",
                period: "Oct 2021 - Nov 2021",
                description: (
                  <>
                    <p>■ Created assets and character animations in pixel art style for the game <i>Cats and the Other Lives</i> using Aseprite.</p>
                  </>
                )
              },
              {
                company: "Fiverr",
                position: "Freelancer",
                period: "Oct 2020 - Dec 2021",
                description: (
                  <>
                    <p>■ Created over 25 VTuber models, each characterized by highly expressive facial features, a wide range of motion, numerous key toggles, and animations.</p>
                    <p>■ Illustrated models for rigging in Clip Studio Paint and rigged them for face tracking with dynamic physics using Live2D Cubism.</p>
                  </>
                )
              },
              {
                company: "Vertigo Games OU",
                position: "Intern",
                period: "Jun 2018 - Feb 2019",
                description: (
                  <>
                    <p>■ Managed player inquiries through support emails and responded to game reviews.</p>
                    <p>■ Conducted analytics on player satisfaction, requests, and bugs.</p>
                    <p>■ Handled community management by creating posts and images to promote games on social media.</p>
                    <p>■ Designed and created UI assets using Adobe Photoshop and implemented them in Unity.</p>
                    <p>■ Conducted thorough game testing on various devices to ensure readiness for QA testing.</p>
                  </>
                )
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
                { name: "GitHub (i)", link: "https://github.com/lidyagercek/", icon: "GitHub_Inactive.png" },
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