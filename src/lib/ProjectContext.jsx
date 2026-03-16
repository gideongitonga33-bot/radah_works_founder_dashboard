import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('radah_current_project');
    if (stored) {
      try { setCurrentProject(JSON.parse(stored)); } catch {}
    }
    base44.entities.Project.filter({ status: 'active' }, '-created_date', 1)
      .then(projects => {
        if (projects.length > 0) {
          const saved = stored ? JSON.parse(stored) : null;
          const found = saved ? projects.find(p => p.id === saved.id) : null;
          setCurrentProject(found || projects[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const switchProject = (project) => {
    setCurrentProject(project);
    localStorage.setItem('radah_current_project', JSON.stringify(project));
  };

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject: switchProject, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}