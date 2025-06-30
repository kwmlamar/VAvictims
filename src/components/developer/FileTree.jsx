import React from 'react';
import { FileCode, Folder } from 'lucide-react';

const buildFileTree = (files) => {
  const tree = {};
  Object.keys(files).forEach(path => {
    let currentLevel = tree;
    const parts = path.split('/');
    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = (index === parts.length - 1) ? 'file' : {};
      }
      currentLevel = currentLevel[part];
    });
  });
  return tree;
};

const FileTreeComponent = ({ tree, onSelectFile, path = '' }) => {
  return (
    <ul className="space-y-1">
      {Object.entries(tree).map(([name, content]) => {
        const currentPath = path ? `${path}/${name}` : name;
        if (typeof content === 'object') {
          return (
            <li key={currentPath}>
              <details open className="group">
                <summary className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-700">
                  <Folder className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold">{name}</span>
                </summary>
                <div className="pl-4 border-l border-gray-600 ml-2">
                  <FileTreeComponent tree={content} onSelectFile={onSelectFile} path={currentPath} />
                </div>
              </details>
            </li>
          );
        } else {
          return (
            <li key={currentPath} onClick={() => onSelectFile(currentPath)}
                className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-blue-500/20">
              <FileCode className="h-4 w-4 text-gray-400" />
              <span>{name}</span>
            </li>
          );
        }
      })}
    </ul>
  );
};

const FileTree = ({ files, onSelectFile }) => {
    const fileTree = buildFileTree(files);
    return <FileTreeComponent tree={fileTree} onSelectFile={onSelectFile} />;
};

export default FileTree;