import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const FirestoreTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const results = [];
      
      try {
        // Test 1: Simple document access with a known ID
        console.log("Test 1: Simple document access");
        const testId = "dca5b1ae-992f-4864-b33e-d7ced9269b53";
        const docRef = doc(db, "agreements", testId);
        const docSnap = await getDoc(docRef);
        
        results.push({
          test: "Document Access",
          success: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
          error: null
        });
        
        // Test 2: Collection access
        console.log("Test 2: Collection access");
        const collectionSnapshot = await getDocs(collection(db, "agreements"));
        
        results.push({
          test: "Collection Access",
          success: true,
          count: collectionSnapshot.docs.length,
          error: null
        });
        
        // Test 3: List all documents
        console.log("Test 3: List all documents");
        const docs = [];
        collectionSnapshot.forEach((doc) => {
          docs.push({
            id: doc.id,
            data: doc.data()
          });
        });
        
        results.push({
          test: "Document List",
          success: true,
          documents: docs,
          error: null
        });
        
      } catch (error) {
        console.error("Test error:", error);
        results.push({
          test: "Error",
          success: false,
          error: error.message,
          code: error.code
        });
      }
      
      setTestResults(results);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Running Firestore tests...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Firestore Test Results</h2>
      {testResults.map((result, index) => (
        <div key={index} style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          border: "1px solid #ccc",
          borderRadius: "5px"
        }}>
          <h3>{result.test}</h3>
          <p><strong>Success:</strong> {result.success ? "✅ Yes" : "❌ No"}</p>
          {result.error && (
            <p><strong>Error:</strong> {result.error}</p>
          )}
          {result.count !== undefined && (
            <p><strong>Document Count:</strong> {result.count}</p>
          )}
          {result.data && (
            <div>
              <strong>Data:</strong>
              <pre style={{ fontSize: "12px", overflow: "auto" }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
          {result.documents && (
            <div>
              <strong>Documents ({result.documents.length}):</strong>
              {result.documents.map((doc, i) => (
                <div key={i} style={{ marginLeft: "20px", marginTop: "5px" }}>
                  <strong>ID:</strong> {doc.id}<br />
                  <strong>Data:</strong>
                  <pre style={{ fontSize: "10px", overflow: "auto" }}>
                    {JSON.stringify(doc.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FirestoreTest;
