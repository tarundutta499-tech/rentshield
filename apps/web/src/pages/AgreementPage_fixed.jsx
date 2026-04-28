// Merge and download stamped agreement function
  const mergeAndDownloadStampedAgreement = async () => {
    // Validate inputs
    if (!generatedAgreementBlob) {
      setMergeError("Please generate agreement first.")
      return
    }
    
    if (!eStampFile) {
      setMergeError("Please upload e-stamp certificate.")
      return
    }

    setMerging(true)
    setMergeError("")

    try {
      // Debug logging
      console.log('Starting merge process...')
      console.log('PDFLib available:', !!window.PDFLib)
      console.log('Generated blob exists:', !!generatedAgreementBlob)
      console.log('E-stamp file type:', eStampFile?.type)
      console.log('E-stamp file size:', eStampFile?.size)

      // Load pdf-lib from CDN
      if (!window.PDFLib) {
        setMergeError("PDF merge library not loaded. Please refresh and try again.")
        return
      }
      
      const { PDFDocument } = window.PDFLib
      let mergedPdf = await PDFDocument.create()

      // Read e-stamp file as ArrayBuffer
      const eStampArrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error("Failed to read e-stamp file"))
        reader.readAsArrayBuffer(eStampFile)
      })

      const eStampBuffer = await eStampArrayBuffer
      
      // Handle e-stamp file
      if (eStampFile.type === 'application/pdf') {
        console.log('Processing PDF e-stamp...')
        
        // Load e-stamp PDF with encryption ignored
        const eStampPdf = await PDFDocument.load(eStampBuffer, {
          ignoreEncryption: true
        })
        const eStampPages = eStampPdf.getPages()
        
        // Copy all e-stamp pages
        for (let i = 0; i < eStampPages.length; i++) {
          const copiedPage = await mergedPdf.copyPages(eStampPages[i])
          mergedPdf.addPage(copiedPage)
        }
        
        console.log('Added', eStampPages.length, 'e-stamp pages')
      } else if (eStampFile.type === 'image/jpeg' || eStampFile.type === 'image/jpg') {
        console.log('Processing JPG e-stamp...')
        
        // If e-stamp is JPG image, embed it
        const imageBytes = await eStampFile.arrayBuffer()
        const jpgImage = await mergedPdf.embedJpg(imageBytes)
        
        // Calculate dimensions to fit image properly
        const maxWidth = 300
        const maxHeight = 300
        let width = jpgImage.width
        let height = jpgImage.height
        
        // Scale image to fit within bounds
        if (width > maxWidth) {
          height = (maxHeight * width) / maxWidth
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxWidth * height) / maxHeight
          height = maxHeight
        }
        
        // Center image on A4 page with margins
        const page = mergedPdf.addPage([595.28, 841.89])
        const { width: pageWidth } = page.getSize()
        const x = (pageWidth - width) / 2
        const y = (841.89 - height) / 2
        
        page.drawImage(jpgImage, x, y, { width, height })
        
        console.log('JPG embedded at position:', { x, y }, 'size:', { width, height })
      } else if (eStampFile.type === 'image/png') {
        console.log('Processing PNG e-stamp...')
        
        // If e-stamp is PNG image, embed it
        const imageBytes = await eStampFile.arrayBuffer()
        const pngImage = await mergedPdf.embedPng(imageBytes)
        
        // Calculate dimensions to fit image properly
        const maxWidth = 300
        const maxHeight = 300
        let width = pngImage.width
        let height = pngImage.height
        
        // Scale image to fit within bounds
        if (width > maxWidth) {
          height = (maxHeight * width) / maxWidth
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxWidth * height) / maxHeight
          height = maxHeight
        }
        
        // Center image on A4 page with margins
        const page = mergedPdf.addPage([595.28, 841.89])
        const { width: pageWidth } = page.getSize()
        const x = (pageWidth - width) / 2
        const y = (841.89 - height) / 2
        
        page.drawImage(pngImage, x, y, { width, height })
        
        console.log('PNG embedded at position:', { x, y }, 'size:', { width, height })
      } else {
        setMergeError("Unsupported file type. Please upload PDF, JPG, or PNG.")
        return
      }

      // Add original agreement pages
      console.log('Adding agreement pages...')
      const agreementBytes = await generatedAgreementBlob.arrayBuffer()
      const agreementPdf = await PDFDocument.load(agreementBytes)
      const agreementPages = agreementPdf.getPages()
      
      // Copy all agreement pages
      agreementPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
      
      console.log('Added', agreementPages.length, 'agreement pages')

      // Save merged PDF
      console.log('Saving merged PDF...')
      const mergedBytes = await mergedPdf.save()
      const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' })
      
      // Download merged PDF
      const mergedUrl = URL.createObjectURL(mergedBlob)
      const link = document.createElement('a')
      link.href = mergedUrl
      link.download = `RentShield_Stamped_Agreement_${formData.tenantName.replace(/[^a-zA-Z0-9]/g, '_')}_${formData.startDate}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(mergedUrl)

      console.log('Merge completed successfully!')
      setSuccess("Stamped agreement ready! Please print and sign with witnesses.")
      
    } catch (error) {
      console.error('Merge error:', error)
      setMergeError("Unable to merge files. Please try again.")
    } finally {
      setMerging(false)
    }
  }
