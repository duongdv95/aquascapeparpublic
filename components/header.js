import React from "react";
import Head from 'next/head';

function Header(props) {
    const title = props.title || "Aquarium PAR Data"
    const content = props.content || 
    "Find aquascaping PAR data of popular fixtures. This currently and in the future will include products such as Finnex, Beamworks, ONF, etc. Submit a request if you would like a fixture tested!"
    const noIndex = props.noIndex || false
    const noIndexTag = (noIndex) ? (<meta name="googlebot" content="noindex"/>) : null
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" 
                content={content} />
            <meta name="p:domain_verify" content="2a0705475dfdb3104371f02d4356cd6c"/>
            <meta property="og:image" content="https://d2s6kvwb83n6p4.cloudfront.net/parfinderlogo.png" /> 
            {noIndexTag}
            <link href="/static/index.css" rel="stylesheet" />
            <link rel="icon" type="image/png" href="https://d2s6kvwb83n6p4.cloudfront.net/favicon.png" />
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossOrigin="anonymous"/>
            <script async src="https://www.googletagmanager.com/gtag/js?id=UA-139749829-2"></script>
            <script dangerouslySetInnerHTML= {
             {
                 __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments)};
                    gtag("js", new Date());
                    gtag("config", "UA-139749829-2");
                 `
             }   
            }/>
        </Head>
    )
}
export default Header